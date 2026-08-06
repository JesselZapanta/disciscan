<?php

use App\Models\AcademicYear;
use App\Models\Student;
use App\Models\StudentTimeLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('lists students for logs with search, academic year filter and pagination', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $ay1 = AcademicYear::factory()->create();
    $ay2 = AcademicYear::factory()->create();

    Student::factory()->create(['id_number' => '2610001', 'firstname' => 'Juan', 'middlename' => null, 'lastname' => 'Santos', 'extension' => null, 'academic_year_id' => $ay1->id]);
    Student::factory()->create(['id_number' => '2610002', 'firstname' => 'Maria', 'lastname' => 'Reyes', 'academic_year_id' => $ay1->id]);
    Student::factory()->create(['id_number' => '2510001', 'firstname' => 'Pedro', 'lastname' => 'Mendoza', 'academic_year_id' => $ay2->id]);

    $this->withHeaders(apiAs($admin))
        ->getJson('/api/admin/student-logs?search=Santos')
        ->assertOk()
        ->assertJsonPath('meta.total', 1)
        ->assertJsonPath('data.0.id_number', '2610001')
        ->assertJsonPath('data.0.name', 'Juan Santos');

    $this->withHeaders(apiAs($admin))
        ->getJson("/api/admin/student-logs?academic_year_id={$ay2->id}")
        ->assertOk()
        ->assertJsonPath('meta.total', 1)
        ->assertJsonPath('data.0.id_number', '2510001');

    $this->withHeaders(apiAs($admin))
        ->getJson('/api/admin/student-logs?per_page=2&page=2')
        ->assertOk()
        ->assertJsonPath('meta.current_page', 2);
});

it('denies non-admin roles and guests from student logs', function () {
    $guard = User::factory()->create(['role' => 'guard']);
    $student = Student::factory()->create();

    $this->getJson('/api/admin/student-logs')
        ->assertUnauthorized();

    $this->getJson("/api/admin/student-logs/{$student->id}")
        ->assertUnauthorized();

    $this->withHeaders(apiAs($guard))
        ->getJson('/api/admin/student-logs')
        ->assertForbidden();
});

it('filters student time logs by date', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $guard = User::factory()->create(['role' => 'guard']);
    $student = Student::factory()->create();

    StudentTimeLog::factory()->create([
        'student_id' => $student->id,
        'type' => 'in',
        'time' => now()->subDay()->setTime(8, 0),
        'performed_by' => $guard->id,
        'academic_year_id' => $student->academic_year_id,
    ]);
    StudentTimeLog::factory()->create([
        'student_id' => $student->id,
        'type' => 'in',
        'time' => now()->setTime(8, 30),
        'performed_by' => $guard->id,
        'academic_year_id' => $student->academic_year_id,
    ]);

    $response = $this->withHeaders(apiAs($admin))
        ->getJson("/api/admin/student-logs/{$student->id}?date=".now()->toDateString())
        ->assertOk();

    $days = $response->json('days');
    expect($days)->toHaveCount(1);
    expect($days[0]['date'])->toBe(now()->toDateString());
    expect($days[0]['total'])->toBe(1);
    expect($response->json('student.id_number'))->toBe($student->id_number);
});

it('shows student time logs grouped by day, newest first', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $guard = User::factory()->create(['role' => 'guard']);
    $student = Student::factory()->create();

    StudentTimeLog::factory()->create([
        'student_id' => $student->id,
        'type' => 'in',
        'time' => now()->subDay()->setTime(8, 0),
        'performed_by' => $guard->id,
        'academic_year_id' => $student->academic_year_id,
    ]);
    StudentTimeLog::factory()->create([
        'student_id' => $student->id,
        'type' => 'out',
        'time' => now()->setTime(17, 0),
        'performed_by' => $guard->id,
        'academic_year_id' => $student->academic_year_id,
    ]);

    $response = $this->withHeaders(apiAs($admin))
        ->getJson("/api/admin/student-logs/{$student->id}")
        ->assertOk();

    $days = $response->json('days');
    expect($days)->toHaveCount(2);
    expect($days[0]['date'])->toBe(now()->toDateString());
    expect($days[0]['total'])->toBe(1);
    expect($days[0]['logs'][0]['type'])->toBe('out');
    expect($days[0]['logs'][0]['performed_by']['name'])->toBe($guard->name);
    expect($days[1]['date'])->toBe(now()->subDay()->toDateString());
    expect($days[1]['logs'][0]['type'])->toBe('in');
    expect($response->json('student.id_number'))->toBe($student->id_number);
});
