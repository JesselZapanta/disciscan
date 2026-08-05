<?php

use App\Models\AcademicYear;
use App\Models\Student;
use App\Models\StudentTimeLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('requires authentication to look up a student', function () {
    $this->getJson('/api/guard/students/lookup/238380')->assertStatus(401);
});

it('forbids admins from using the student scan endpoints', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $this->withHeaders(apiAs($admin))
        ->getJson('/api/guard/students/lookup/238380')
        ->assertStatus(403);
});

it('looks up a student in the active academic year', function () {
    $guard = User::factory()->create(['role' => 'guard']);
    $year = AcademicYear::factory()->active()->create();
    $student = Student::factory()->create([
        'id_number' => '238380',
        'firstname' => 'Kenley',
        'middlename' => 'Cañete',
        'lastname' => 'Broñola',
        'contact_no' => '09708734028',
        'program_and_year' => 'BSCS-3',
        'extension' => null,
        'academic_year_id' => $year->id,
    ]);

    $this->withHeaders(apiAs($guard))
        ->getJson('/api/guard/students/lookup/238380')
        ->assertOk()
        ->assertJsonPath('data.id', $student->id)
        ->assertJsonPath('data.id_number', '238380')
        ->assertJsonPath('data.name', 'Kenley Cañete Broñola')
        ->assertJsonPath('data.program_and_year', 'BSCS-3')
        ->assertJsonPath('data.status', null)
        ->assertJsonPath('data.academic_year.code', $year->code)
        ->assertJsonCount(0, 'data.time_logs');
});

it('returns 404 when the student belongs to a different academic year', function () {
    $guard = User::factory()->create(['role' => 'guard']);
    AcademicYear::factory()->active()->create();
    Student::factory()->create([
        'id_number' => '238380',
        'academic_year_id' => AcademicYear::factory()->inactive()->create()->id,
    ]);

    $this->withHeaders(apiAs($guard))
        ->getJson('/api/guard/students/lookup/238380')
        ->assertStatus(404)
        ->assertJsonPath('message', 'Student not found for the active academic year.');
});

it('returns 404 when there is no active academic year', function () {
    $guard = User::factory()->create(['role' => 'guard']);
    AcademicYear::factory()->inactive()->create();

    $this->withHeaders(apiAs($guard))
        ->getJson('/api/guard/students/lookup/238380')
        ->assertStatus(404)
        ->assertJsonPath('message', 'No active academic year is set.');
});

it('checks in a student and records the time log with the academic year', function () {
    $guard = User::factory()->create(['role' => 'guard', 'name' => 'Jose Guard']);
    $year = AcademicYear::factory()->active()->create();
    $student = Student::factory()->create(['academic_year_id' => $year->id]);

    $response = $this->withHeaders(apiAs($guard))
        ->postJson("/api/guard/students/{$student->id}/check-in");

    $response->assertOk()
        ->assertJsonPath('data.status', 'in')
        ->assertJsonPath('data.time_logs.0.type', 'in')
        ->assertJsonPath('data.time_logs.0.performed_by.name', 'Jose Guard');

    $log = StudentTimeLog::query()->where('student_id', $student->id)->first();
    expect($log->type)->toBe('in');
    expect($log->performed_by)->toBe($guard->id);
    expect($log->academic_year_id)->toBe($year->id);
    expect($log->time)->not->toBeNull();
});

it('rejects a second check-in while the student is inside', function () {
    $guard = User::factory()->create(['role' => 'guard']);
    $year = AcademicYear::factory()->active()->create();
    $student = Student::factory()->create(['academic_year_id' => $year->id]);
    StudentTimeLog::factory()->create(['student_id' => $student->id, 'type' => 'in', 'academic_year_id' => $year->id]);

    $this->withHeaders(apiAs($guard))
        ->postJson("/api/guard/students/{$student->id}/check-in")
        ->assertStatus(409)
        ->assertJsonPath('message', 'Student is already checked in.');
});

it('checks out a checked-in student', function () {
    $guard = User::factory()->create(['role' => 'guard', 'name' => 'Jose Guard']);
    $year = AcademicYear::factory()->active()->create();
    $student = Student::factory()->create(['academic_year_id' => $year->id]);
    StudentTimeLog::factory()->create(['student_id' => $student->id, 'type' => 'in', 'academic_year_id' => $year->id]);

    $response = $this->withHeaders(apiAs($guard))
        ->postJson("/api/guard/students/{$student->id}/check-out");

    $response->assertOk()
        ->assertJsonPath('data.status', 'out')
        ->assertJsonPath('data.time_logs.0.type', 'out')
        ->assertJsonPath('data.time_logs.0.performed_by.name', 'Jose Guard');

    expect(StudentTimeLog::query()->where('student_id', $student->id)->count())->toBe(2);
});

it('rejects checkout when the student is not inside', function () {
    $guard = User::factory()->create(['role' => 'guard']);
    $year = AcademicYear::factory()->active()->create();
    $student = Student::factory()->create(['academic_year_id' => $year->id]);
    StudentTimeLog::factory()->create(['student_id' => $student->id, 'type' => 'out', 'academic_year_id' => $year->id]);

    $this->withHeaders(apiAs($guard))
        ->postJson("/api/guard/students/{$student->id}/check-out")
        ->assertStatus(409)
        ->assertJsonPath('message', 'Student must be checked in before checking out.');
});

it('rejects check-in for a student outside the active academic year', function () {
    $guard = User::factory()->create(['role' => 'guard']);
    AcademicYear::factory()->active()->create();
    $student = Student::factory()->create([
        'academic_year_id' => AcademicYear::factory()->inactive()->create()->id,
    ]);

    $this->withHeaders(apiAs($guard))
        ->postJson("/api/guard/students/{$student->id}/check-in")
        ->assertStatus(409)
        ->assertJsonPath('message', 'Student does not belong to the active academic year.');

    expect(StudentTimeLog::query()->where('student_id', $student->id)->count())->toBe(0);
});

it('allows re-entry check-in after checkout', function () {
    $guard = User::factory()->create(['role' => 'guard']);
    $year = AcademicYear::factory()->active()->create();
    $student = Student::factory()->create(['academic_year_id' => $year->id]);

    $this->withHeaders(apiAs($guard))
        ->postJson("/api/guard/students/{$student->id}/check-in")
        ->assertOk()
        ->assertJsonPath('data.status', 'in');

    $this->withHeaders(apiAs($guard))
        ->postJson("/api/guard/students/{$student->id}/check-out")
        ->assertOk()
        ->assertJsonPath('data.status', 'out');

    $this->withHeaders(apiAs($guard))
        ->postJson("/api/guard/students/{$student->id}/check-in")
        ->assertOk()
        ->assertJsonPath('data.status', 'in');

    $logs = StudentTimeLog::query()->where('student_id', $student->id)->orderBy('id')->get();
    expect($logs->pluck('type')->all())->toBe(['in', 'out', 'in']);
});
