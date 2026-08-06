<?php

use App\Models\AcademicYear;
use App\Models\Student;
use App\Models\StudentViolation;
use App\Models\User;
use App\Models\ViolationType;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('lists students with violations and their resolved or non-compliant status, with search, academic year filter and pagination', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $ay1 = AcademicYear::factory()->create();
    $ay2 = AcademicYear::factory()->create();

    $juan = Student::factory()->create(['id_number' => '2610001', 'firstname' => 'Juan', 'middlename' => null, 'lastname' => 'Santos', 'extension' => null, 'academic_year_id' => $ay1->id]);
    $maria = Student::factory()->create(['id_number' => '2610002', 'firstname' => 'Maria', 'lastname' => 'Reyes', 'academic_year_id' => $ay1->id]);
    $pedro = Student::factory()->create(['id_number' => '2510001', 'firstname' => 'Pedro', 'lastname' => 'Mendoza', 'academic_year_id' => $ay2->id]);
    $noViolation = Student::factory()->create(['id_number' => '2410001', 'firstname' => 'Ana', 'lastname' => 'Cruz', 'academic_year_id' => $ay2->id]);

    StudentViolation::factory()->create(['student_id' => $juan->id]);
    StudentViolation::factory()->create(['student_id' => $maria->id, 'status' => 'Resolved']);
    StudentViolation::factory()->create(['student_id' => $pedro->id, 'status' => 'Resolved']);
    StudentViolation::factory()->create(['student_id' => $pedro->id]);

    $this->withHeaders(apiAs($admin))
        ->getJson('/api/admin/student-violations?search=Santos')
        ->assertOk()
        ->assertJsonPath('meta.total', 1)
        ->assertJsonPath('data.0.id_number', '2610001')
        ->assertJsonPath('data.0.name', 'Juan Santos')
        ->assertJsonPath('data.0.status', 'Non-compliant');

    $this->withHeaders(apiAs($admin))
        ->getJson('/api/admin/student-violations?search=Reyes')
        ->assertOk()
        ->assertJsonPath('meta.total', 1)
        ->assertJsonPath('data.0.status', 'Resolved');

    $this->withHeaders(apiAs($admin))
        ->getJson('/api/admin/student-violations?search=Mendoza')
        ->assertOk()
        ->assertJsonPath('meta.total', 1)
        ->assertJsonPath('data.0.status', 'Non-compliant');

    $this->withHeaders(apiAs($admin))
        ->getJson("/api/admin/student-violations?academic_year_id={$ay1->id}")
        ->assertOk()
        ->assertJsonPath('meta.total', 2);

    $this->withHeaders(apiAs($admin))
        ->getJson('/api/admin/student-violations?per_page=2&page=2')
        ->assertOk()
        ->assertJsonPath('meta.total', 3)
        ->assertJsonPath('meta.current_page', 2)
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

it('resolves a single student violation', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $student = Student::factory()->create();
    $violation = StudentViolation::factory()->create(['student_id' => $student->id]);
    $other = StudentViolation::factory()->create(['student_id' => $student->id]);

    $this->withHeaders(apiAs($admin))
        ->postJson("/api/admin/student-violations/{$violation->id}/resolve")
        ->assertOk()
        ->assertJsonPath('id', $violation->id)
        ->assertJsonPath('status', 'Resolved');

    expect($violation->fresh()->status)->toBe('Resolved');
    expect($other->fresh()->status)->toBe('Non-compliant');
});

it('resolves all student violations at once', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $student = Student::factory()->create();
    StudentViolation::factory()->count(3)->create(['student_id' => $student->id]);
    StudentViolation::factory()->create(['student_id' => $student->id, 'status' => 'Resolved']);

    $this->withHeaders(apiAs($admin))
        ->postJson("/api/admin/student-violations/{$student->id}/resolve-all")
        ->assertOk()
        ->assertJsonPath('resolved', 3);

    expect(StudentViolation::where('student_id', $student->id)->where('status', '!=', 'Resolved')->count())->toBe(0);
});

it('undoes a resolve-all by reverting only the given violations', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $student = Student::factory()->create();
    $other = Student::factory()->create();
    $v1 = StudentViolation::factory()->create(['student_id' => $student->id, 'status' => 'Resolved']);
    $v2 = StudentViolation::factory()->create(['student_id' => $student->id, 'status' => 'Resolved']);
    $foreign = StudentViolation::factory()->create(['student_id' => $other->id, 'status' => 'Resolved']);

    $this->withHeaders(apiAs($admin))
        ->postJson("/api/admin/student-violations/{$student->id}/unresolve-all", [
            'violation_ids' => [$v1->id, $foreign->id],
        ])
        ->assertOk()
        ->assertJsonPath('unresolved', 1);

    expect($v1->fresh()->status)->toBe('Non-compliant');
    expect($v2->fresh()->status)->toBe('Resolved');
    expect($foreign->fresh()->status)->toBe('Resolved');
});

it('denies non-admin roles and guests from resolving violations', function () {
    $guard = User::factory()->create(['role' => 'guard']);
    $student = Student::factory()->create();
    $violation = StudentViolation::factory()->create(['student_id' => $student->id]);

    $this->postJson("/api/admin/student-violations/{$violation->id}/resolve")
        ->assertUnauthorized();

    $this->postJson("/api/admin/student-violations/{$student->id}/resolve-all")
        ->assertUnauthorized();

    $this->withHeaders(apiAs($guard))
        ->postJson("/api/admin/student-violations/{$violation->id}/resolve")
        ->assertForbidden();
});
