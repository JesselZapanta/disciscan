<?php

use App\Models\AcademicYear;
use App\Models\Student;
use App\Models\StudentViolation;
use App\Models\User;
use App\Models\ViolationType;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('lists only students with non-compliant violations, with search, academic year filter and pagination', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $ay1 = AcademicYear::factory()->create();
    $ay2 = AcademicYear::factory()->create();

    $juan = Student::factory()->create(['id_number' => '2610001', 'firstname' => 'Juan', 'middlename' => null, 'lastname' => 'Santos', 'extension' => null, 'academic_year_id' => $ay1->id]);
    $maria = Student::factory()->create(['id_number' => '2610002', 'firstname' => 'Maria', 'lastname' => 'Reyes', 'academic_year_id' => $ay1->id]);
    $pedro = Student::factory()->create(['id_number' => '2510001', 'firstname' => 'Pedro', 'lastname' => 'Mendoza', 'academic_year_id' => $ay2->id]);
    $noViolation = Student::factory()->create(['id_number' => '2410001', 'firstname' => 'Ana', 'lastname' => 'Cruz', 'academic_year_id' => $ay2->id]);

    StudentViolation::factory()->create(['student_id' => $juan->id]);
    StudentViolation::factory()->create(['student_id' => $pedro->id]);
    StudentViolation::factory()->create(['student_id' => $maria->id, 'status' => 'Cleared']);

    $this->withHeaders(apiAs($admin))
        ->getJson('/api/admin/student-violations?search=Santos')
        ->assertOk()
        ->assertJsonPath('meta.total', 1)
        ->assertJsonPath('data.0.id_number', '2610001')
        ->assertJsonPath('data.0.name', 'Juan Santos');

    $this->withHeaders(apiAs($admin))
        ->getJson("/api/admin/student-violations?academic_year_id={$ay2->id}")
        ->assertOk()
        ->assertJsonPath('meta.total', 1)
        ->assertJsonPath('data.0.id_number', '2510001');

    $this->withHeaders(apiAs($admin))
        ->getJson('/api/admin/student-violations?per_page=1&page=2')
        ->assertOk()
        ->assertJsonPath('meta.total', 2)
        ->assertJsonPath('meta.current_page', 2)
        ->assertJsonMissing(['id_number' => '2610002'])
        ->assertJsonMissing(['id_number' => '2410001']);
});

it('denies non-admin roles and guests from student violations', function () {
    $guard = User::factory()->create(['role' => 'guard']);
    $student = Student::factory()->create();

    $this->getJson('/api/admin/student-violations')
        ->assertUnauthorized();

    $this->getJson("/api/admin/student-violations/{$student->id}")
        ->assertUnauthorized();

    $this->withHeaders(apiAs($guard))
        ->getJson('/api/admin/student-violations')
        ->assertForbidden();
});

it('shows student violations grouped by day, newest first', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $guard = User::factory()->create(['role' => 'guard']);
    $student = Student::factory()->create();
    $typeA = ViolationType::factory()->create(['name' => 'Failure to Wear School ID']);
    $typeB = ViolationType::factory()->create(['name' => 'Improper Upper Garment']);

    $older = StudentViolation::factory()->create([
        'student_id' => $student->id,
        'violation_type_ids' => [$typeA->id],
        'remarks' => 'First offense.',
        'recorded_by' => $guard->id,
    ]);
    $older->created_at = now()->subDay()->setTime(10, 30);
    $older->save();

    $newer = StudentViolation::factory()->create([
        'student_id' => $student->id,
        'violation_type_ids' => [$typeA->id, $typeB->id],
        'remarks' => 'Caught again.',
        'recorded_by' => $guard->id,
    ]);
    $newer->created_at = now()->setTime(8, 15);
    $newer->save();

    $response = $this->withHeaders(apiAs($admin))
        ->getJson("/api/admin/student-violations/{$student->id}")
        ->assertOk();

    $days = $response->json('days');
    expect($days)->toHaveCount(2);
    expect($days[0]['date'])->toBe(now()->toDateString());
    expect($days[0]['total'])->toBe(1);
    expect($days[0]['violations'][0]['violation_types'])->toBe(['Failure to Wear School ID', 'Improper Upper Garment']);
    expect($days[0]['violations'][0]['status'])->toBe('Non-compliant');
    expect($days[0]['violations'][0]['remarks'])->toBe('Caught again.');
    expect($days[0]['violations'][0]['recorded_by']['name'])->toBe($guard->name);
    expect($days[1]['date'])->toBe(now()->subDay()->toDateString());
    expect($days[1]['violations'][0]['violation_types'])->toBe(['Failure to Wear School ID']);
    expect($response->json('student.id_number'))->toBe($student->id_number);
});

it('filters student violations by date', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $guard = User::factory()->create(['role' => 'guard']);
    $student = Student::factory()->create();
    $type = ViolationType::factory()->create();

    $today = StudentViolation::factory()->create([
        'student_id' => $student->id,
        'violation_type_ids' => [$type->id],
        'recorded_by' => $guard->id,
    ]);
    $today->created_at = now()->setTime(9, 0);
    $today->save();

    $yesterday = StudentViolation::factory()->create([
        'student_id' => $student->id,
        'violation_type_ids' => [$type->id],
        'recorded_by' => $guard->id,
    ]);
    $yesterday->created_at = now()->subDay()->setTime(9, 0);
    $yesterday->save();

    $response = $this->withHeaders(apiAs($admin))
        ->getJson("/api/admin/student-violations/{$student->id}?date=".now()->toDateString())
        ->assertOk();

    $days = $response->json('days');
    expect($days)->toHaveCount(1);
    expect($days[0]['date'])->toBe(now()->toDateString());
    expect($days[0]['total'])->toBe(1);
});
