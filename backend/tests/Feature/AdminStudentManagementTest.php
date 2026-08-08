<?php

use App\Models\AcademicYear;
use App\Models\Student;
use App\Models\StudentTimeLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('lists students with search, academic year filter and pagination', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $ay1 = AcademicYear::factory()->create();
    $ay2 = AcademicYear::factory()->create();

    Student::factory()->create(['id_number' => '2610001', 'firstname' => 'Juan', 'middlename' => null, 'lastname' => 'Santos', 'extension' => null, 'academic_year_id' => $ay1->id]);
    Student::factory()->create(['id_number' => '2610002', 'firstname' => 'Maria', 'lastname' => 'Reyes', 'academic_year_id' => $ay1->id]);
    Student::factory()->create(['id_number' => '2510001', 'firstname' => 'Pedro', 'lastname' => 'Mendoza', 'academic_year_id' => $ay2->id]);

    $this->withHeaders(apiAs($admin))
        ->getJson('/api/admin/students?search=Santos')
        ->assertOk()
        ->assertJsonPath('meta.total', 1)
        ->assertJsonPath('data.0.id_number', '2610001')
        ->assertJsonPath('data.0.name', 'Juan Santos');

    $this->withHeaders(apiAs($admin))
        ->getJson("/api/admin/students?academic_year_id={$ay2->id}")
        ->assertOk()
        ->assertJsonPath('meta.total', 1)
        ->assertJsonPath('data.0.id_number', '2510001');
});

it('paginates students', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    Student::factory()->count(25)->create();

    $response = $this->withHeaders(apiAs($admin))
        ->getJson('/api/admin/students?per_page=10&page=2');

    $response->assertOk()
        ->assertJsonPath('meta.current_page', 2)
        ->assertJsonPath('meta.last_page', 3);

    expect(count($response->json('data')))->toBe(10);
});

it('sorts students by id descending by default and ascending on request', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $first = Student::factory()->create();
    $second = Student::factory()->create();
    $third = Student::factory()->create();

    $this->withHeaders(apiAs($admin))->getJson('/api/admin/students')
        ->assertOk()
        ->assertJsonPath('data.0.id', $third->id)
        ->assertJsonPath('data.1.id', $second->id)
        ->assertJsonPath('data.2.id', $first->id);

    $this->withHeaders(apiAs($admin))->getJson('/api/admin/students?sort_dir=asc')
        ->assertOk()
        ->assertJsonPath('data.0.id', $first->id)
        ->assertJsonPath('data.2.id', $third->id);
});

it('creates a student', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $academicYear = AcademicYear::factory()->create();

    $response = $this->withHeaders(apiAs($admin))->postJson('/api/admin/students', [
        'id_number' => '2610001',
        'firstname' => 'Juan',
        'middlename' => 'Dela Cruz',
        'lastname' => 'Santos',
        'extension' => 'Jr.',
        'contact_no' => '09171234567',
        'program_and_year' => 'BSIT 1A',
        'academic_year_id' => $academicYear->id,
    ]);

    $response->assertStatus(201)
        ->assertJsonPath('data.id_number', '2610001')
        ->assertJsonPath('data.name', 'Juan Dela Cruz Santos Jr.')
        ->assertJsonPath('data.extension', 'Jr.')
        ->assertJsonPath('data.program_and_year', 'BSIT 1A')
        ->assertJsonPath('data.academic_year.id', $academicYear->id);

    $this->assertDatabaseHas('students', [
        'id_number' => '2610001',
        'firstname' => 'Juan',
        'extension' => 'Jr.',
    ]);
});

it('creates a student without middlename and academic year', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $this->withHeaders(apiAs($admin))->postJson('/api/admin/students', [
        'id_number' => '2610002',
        'firstname' => 'Maria',
        'lastname' => 'Reyes',
        'contact_no' => '09181234567',
        'program_and_year' => 'BSIT 1A',
    ])->assertStatus(201)
        ->assertJsonPath('data.name', 'Maria Reyes')
        ->assertJsonPath('data.academic_year_id', null);
});

it('validates student creation payload', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $this->withHeaders(apiAs($admin))->postJson('/api/admin/students', [
        'id_number' => '',
        'firstname' => '',
        'lastname' => '',
        'contact_no' => '',
        'program_and_year' => '',
    ])->assertStatus(422)
        ->assertJsonValidationErrors(['id_number', 'firstname', 'lastname', 'contact_no', 'program_and_year']);
});

it('rejects duplicate student id numbers in the same academic year', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $existing = Student::factory()->create(['id_number' => '2610001']);

    $this->withHeaders(apiAs($admin))->postJson('/api/admin/students', [
        'id_number' => '2610001',
        'firstname' => 'Juan',
        'lastname' => 'Santos',
        'contact_no' => '09171234567',
        'program_and_year' => 'BSIT 1A',
        'academic_year_id' => $existing->academic_year_id,
    ])->assertStatus(422)
        ->assertJsonValidationErrors(['id_number']);
});

it('allows the same id number in a different academic year', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $ay1 = AcademicYear::factory()->create();
    $ay2 = AcademicYear::factory()->create();
    Student::factory()->create(['id_number' => '2610001', 'academic_year_id' => $ay1->id]);

    $this->withHeaders(apiAs($admin))->postJson('/api/admin/students', [
        'id_number' => '2610001',
        'firstname' => 'Juan',
        'lastname' => 'Santos',
        'contact_no' => '09171234567',
        'program_and_year' => 'BSIT 1A',
        'academic_year_id' => $ay2->id,
    ])->assertStatus(201);

    $this->assertSame(2, Student::where('id_number', '2610001')->count());
});

it('rejects an invalid contact number', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $this->withHeaders(apiAs($admin))->postJson('/api/admin/students', [
        'id_number' => '2610001',
        'firstname' => 'Juan',
        'lastname' => 'Santos',
        'contact_no' => 'not-a-number',
        'program_and_year' => 'BSIT 1A',
    ])->assertStatus(422)
        ->assertJsonValidationErrors(['contact_no']);
});

it('rejects an unknown academic year', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $this->withHeaders(apiAs($admin))->postJson('/api/admin/students', [
        'id_number' => '2610001',
        'firstname' => 'Juan',
        'lastname' => 'Santos',
        'contact_no' => '09171234567',
        'program_and_year' => 'BSIT 1A',
        'academic_year_id' => 999999,
    ])->assertStatus(422)
        ->assertJsonValidationErrors(['academic_year_id']);
});

it('updates a student', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $student = Student::factory()->create(['id_number' => '2610001']);
    $academicYear = AcademicYear::factory()->create();

    $response = $this->withHeaders(apiAs($admin))->postJson("/api/admin/students/{$student->id}", [
        'id_number' => '2610002',
        'firstname' => 'Maria',
        'middlename' => '',
        'lastname' => 'Reyes',
        'extension' => 'II',
        'contact_no' => '09181234567',
        'program_and_year' => 'BSCS 2A',
        'academic_year_id' => $academicYear->id,
    ]);

    $response->assertOk()
        ->assertJsonPath('data.id_number', '2610002')
        ->assertJsonPath('data.name', 'Maria Reyes II')
        ->assertJsonPath('data.program_and_year', 'BSCS 2A');

    $student->refresh();
    $this->assertSame('2610002', $student->id_number);
    $this->assertSame('II', $student->extension);
    $this->assertSame($academicYear->id, $student->academic_year_id);
});

it('allows keeping the same id number on update', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $student = Student::factory()->create(['id_number' => '2610001']);

    $this->withHeaders(apiAs($admin))->postJson("/api/admin/students/{$student->id}", [
        'id_number' => '2610001',
        'firstname' => $student->firstname,
        'lastname' => $student->lastname,
        'contact_no' => $student->contact_no,
        'program_and_year' => $student->program_and_year,
        'academic_year_id' => $student->academic_year_id,
    ])->assertOk();
});

it('deletes a student', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $student = Student::factory()->create();

    $this->withHeaders(apiAs($admin))->deleteJson("/api/admin/students/{$student->id}")
        ->assertOk()
        ->assertJsonPath('message', 'Student deleted.');

    $this->assertDatabaseMissing('students', ['id' => $student->id]);
});

it('blocks deleting a student with time logs', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $student = Student::factory()->create();

    StudentTimeLog::factory()->create(['student_id' => $student->id]);

    $this->withHeaders(apiAs($admin))->deleteJson("/api/admin/students/{$student->id}")
        ->assertStatus(422)
        ->assertJsonValidationErrors(['status']);

    $this->assertDatabaseHas('students', ['id' => $student->id]);
});

it('forbids non-admin users from managing students', function () {
    $guard = User::factory()->create(['role' => 'guard']);

    $this->withHeaders(apiAs($guard))->getJson('/api/admin/students')->assertStatus(403);
    $this->withHeaders(apiAs($guard))->postJson('/api/admin/students', [
        'id_number' => '2610001',
        'firstname' => 'Juan',
        'lastname' => 'Santos',
        'contact_no' => '09171234567',
        'program_and_year' => 'BSIT 1A',
    ])->assertStatus(403);
});

it('seeds the default students', function () {
    $this->seed(DatabaseSeeder::class);

    expect(Student::count())->toBe(3)
        ->and(Student::where('id_number', '261001')->where('program_and_year', 'BSCS 1')->where('extension', 'Jr.')->exists())->toBeTrue()
        ->and(Student::where('id_number', '261002')->where('program_and_year', 'BSCS 1')->exists())->toBeTrue()
        ->and(Student::where('id_number', '251001')->where('program_and_year', 'BSCS 2')->exists())->toBeTrue();
});
