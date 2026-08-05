<?php

use App\Models\AcademicYear;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

uses(RefreshDatabase::class);

function makeStudentXlsx(array $rows): UploadedFile
{
    $path = tempnam(sys_get_temp_dir(), 'import').'.xlsx';

    $spreadsheet = new Spreadsheet;
    $spreadsheet->getActiveSheet()->fromArray([
        ['id_number', 'firstname', 'middlename', 'lastname', 'extension', 'contact_no', 'program_and_year', 'academic_year_id'],
        ...$rows,
    ], null, 'A1');

    (new Xlsx($spreadsheet))->save($path);

    return new UploadedFile(
        $path,
        'students.xlsx',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        null,
        true
    );
}

function makeStudentXlsxWithHeaders(array $headers, array $rows): UploadedFile
{
    $path = tempnam(sys_get_temp_dir(), 'import').'.xlsx';

    $spreadsheet = new Spreadsheet;
    $spreadsheet->getActiveSheet()->fromArray([$headers, ...$rows], null, 'A1');

    (new Xlsx($spreadsheet))->save($path);

    return new UploadedFile(
        $path,
        'students.xlsx',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        null,
        true
    );
}

it('imports students from a valid excel file', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $academicYear = AcademicYear::factory()->create();

    $file = makeStudentXlsx([
        ['2610001', 'Juan', 'Dela Cruz', 'Santos', 'Jr.', '09171234567', 'BSIT 1A', $academicYear->id],
        ['2610002', 'Maria', '', 'Reyes', '', '09181234567', 'BSIT 1A', $academicYear->id],
    ]);

    $response = $this->withHeaders(apiAs($admin))
        ->postJson('/api/admin/students/import', ['file' => $file]);

    $response->assertOk()
        ->assertJsonPath('report.total', 2)
        ->assertJsonPath('report.imported', 2)
        ->assertJsonPath('report.skipped_duplicates', 0)
        ->assertJsonPath('report.failed', 0);

    $this->assertDatabaseHas('students', [
        'id_number' => '2610001',
        'firstname' => 'Juan',
        'middlename' => 'Dela Cruz',
        'lastname' => 'Santos',
        'extension' => 'Jr.',
        'academic_year_id' => $academicYear->id,
    ]);
    $this->assertDatabaseHas('students', ['id_number' => '2610002', 'middlename' => null, 'extension' => null]);
});

it('skips duplicate id numbers that already exist and reports them', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $academicYear = AcademicYear::factory()->create();
    Student::factory()->create(['id_number' => '2610001', 'academic_year_id' => $academicYear->id]);

    $file = makeStudentXlsx([
        ['2610001', 'Juan', '', 'Santos', '', '09171234567', 'BSIT 1A', $academicYear->id],
        ['2610002', 'Maria', '', 'Reyes', '', '09181234567', 'BSIT 1A', $academicYear->id],
    ]);

    $response = $this->withHeaders(apiAs($admin))
        ->postJson('/api/admin/students/import', ['file' => $file]);

    $response->assertOk()
        ->assertJsonPath('report.imported', 1)
        ->assertJsonPath('report.skipped_duplicates', 1)
        ->assertJsonPath('report.rows.0.type', 'duplicate')
        ->assertJsonPath('report.rows.0.id_number', '2610001')
        ->assertJsonPath('report.rows.0.reason', 'Duplicate ID number in the same academic year')
        ->assertJsonPath('report.rows.0.row', 2);

    $this->assertDatabaseMissing('students', ['id_number' => '2610001', 'lastname' => 'Santos']);
});

it('imports duplicate id numbers across different academic years already in the database', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $ay1 = AcademicYear::factory()->create();
    $ay2 = AcademicYear::factory()->create();
    Student::factory()->create(['id_number' => '2610001', 'academic_year_id' => $ay1->id]);

    $file = makeStudentXlsx([
        ['2610001', 'Juan', '', 'Santos', '', '09171234567', 'BSIT 1A', $ay2->id],
    ]);

    $this->withHeaders(apiAs($admin))
        ->postJson('/api/admin/students/import', ['file' => $file])
        ->assertOk()
        ->assertJsonPath('report.imported', 1)
        ->assertJsonPath('report.skipped_duplicates', 0);

    $this->assertSame(2, Student::where('id_number', '2610001')->count());
});

it('imports duplicate id numbers within the same file when academic years differ', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $ay1 = AcademicYear::factory()->create();
    $ay2 = AcademicYear::factory()->create();

    $file = makeStudentXlsx([
        ['2610001', 'Juan', '', 'Santos', '', '09171234567', 'BSIT 1A', $ay1->id],
        ['2610001', 'Juan', '', 'Santos', '', '09171234567', 'BSIT 1A', $ay2->id],
    ]);

    $this->withHeaders(apiAs($admin))
        ->postJson('/api/admin/students/import', ['file' => $file])
        ->assertOk()
        ->assertJsonPath('report.imported', 2)
        ->assertJsonPath('report.skipped_duplicates', 0);

    $this->assertSame(2, Student::where('id_number', '2610001')->count());
});

it('skips duplicate id numbers within the same file', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $academicYear = AcademicYear::factory()->create();

    $file = makeStudentXlsx([
        ['2610001', 'Juan', '', 'Santos', '', '09171234567', 'BSIT 1A', $academicYear->id],
        ['2610001', 'Juan', '', 'Santos', '', '09171234567', 'BSIT 1A', $academicYear->id],
    ]);

    $response = $this->withHeaders(apiAs($admin))
        ->postJson('/api/admin/students/import', ['file' => $file]);

    $response->assertOk()
        ->assertJsonPath('report.imported', 1)
        ->assertJsonPath('report.skipped_duplicates', 1);

    $this->assertSame(1, Student::where('id_number', '2610001')->count());
});

it('reports rows with invalid data instead of importing them', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $file = makeStudentXlsx([
        ['2610001', 'Juan', '', '', '', '09171234567', 'BSIT 1A', ''],
        ['2610002', 'Maria', '', 'Reyes', '', 'not-a-number', 'BSIT 1A', ''],
        ['2610003', 'Pedro', '', 'Mendoza', '', '09191234567', 'BSIT 1A', '999999'],
        ['2610004', '', '', 'Reyes', '', '09191234567', 'BSIT 1A', ''],
    ]);

    $response = $this->withHeaders(apiAs($admin))
        ->postJson('/api/admin/students/import', ['file' => $file]);

    $response->assertOk()
        ->assertJsonPath('report.imported', 0)
        ->assertJsonPath('report.failed', 4)
        ->assertJsonPath('report.rows.0.reason', 'Missing last name')
        ->assertJsonPath('report.rows.1.reason', 'Invalid contact number format')
        ->assertJsonPath('report.rows.2.reason', 'Unknown academic year')
        ->assertJsonPath('report.rows.3.reason', 'Missing first name');

    $this->assertSame(0, Student::count());
});

it('imports a large file in bulk', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $academicYear = AcademicYear::factory()->create();

    $rows = [];
    foreach (range(1, 2500) as $i) {
        $rows[] = [sprintf('ID%05d', $i), 'Student', '', 'Test', '', '09170000000', 'BSIT 1A', $academicYear->id];
    }

    $file = makeStudentXlsx($rows);

    $response = $this->withHeaders(apiAs($admin))
        ->postJson('/api/admin/students/import', ['file' => $file]);

    $response->assertOk()
        ->assertJsonPath('report.total', 2500)
        ->assertJsonPath('report.imported', 2500);

    $this->assertSame(2500, Student::count());
});

it('rejects a non-excel file', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $file = UploadedFile::fake()->create('students.csv', 100, 'text/csv');

    $this->withHeaders(apiAs($admin))
        ->postJson('/api/admin/students/import', ['file' => $file])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['file']);
});

it('rejects a file with the wrong header format', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $file = makeStudentXlsxWithHeaders(
        ['name', 'email', 'course'],
        [['Juan', 'juan@example.com', 'BSIT 1A']]
    );

    $this->withHeaders(apiAs($admin))
        ->postJson('/api/admin/students/import', ['file' => $file])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['file'])
        ->assertJsonPath(
            'message',
            'The file header does not match the required format. Expected: id_number, firstname, middlename, lastname, extension, contact_no, program_and_year, academic_year_id. Found: name, email, course.'
        );

    $this->assertSame(0, Student::count());
});

it('rejects a header-only file with no student rows', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $file = makeStudentXlsxWithHeaders(
        ['id_number', 'firstname', 'middlename', 'lastname', 'extension', 'contact_no', 'program_and_year', 'academic_year_id'],
        []
    );

    $this->withHeaders(apiAs($admin))
        ->postJson('/api/admin/students/import', ['file' => $file])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['file'])
        ->assertJsonPath('message', 'The file must contain a header row and at least one student row.');

    $this->assertSame(0, Student::count());
});

it('accepts headers with leading or trailing whitespace and case differences', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $academicYear = AcademicYear::factory()->create();

    $file = makeStudentXlsxWithHeaders(
        [' ID_NUMBER ', 'Firstname', 'Middlename', 'Lastname', 'Extension', 'Contact_No', 'Program_and_Year', 'Academic_Year_Id'],
        [['2610001', 'Juan', '', 'Santos', 'III', '09171234567', 'BSIT 1A', $academicYear->id]]
    );

    $response = $this->withHeaders(apiAs($admin))
        ->postJson('/api/admin/students/import', ['file' => $file]);

    $response->assertOk()
        ->assertJsonPath('report.imported', 1);
});

it('downloads the student import template', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $this->withHeaders(apiAs($admin))
        ->get('/api/admin/students/import-template')
        ->assertOk()
        ->assertHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        ->assertHeader('Content-Disposition', 'attachment; filename=DISCISCAN-student-import-template.xlsx');
});

it('forbids non-admin users from importing students', function () {
    $guard = User::factory()->create(['role' => 'guard']);

    $file = UploadedFile::fake()->create('students.xlsx', 100, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    $this->withHeaders(apiAs($guard))
        ->postJson('/api/admin/students/import', ['file' => $file])
        ->assertStatus(403);
});
