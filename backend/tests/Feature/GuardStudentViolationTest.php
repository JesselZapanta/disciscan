<?php

use App\Models\AcademicYear;
use App\Models\Student;
use App\Models\StudentViolation;
use App\Models\User;
use App\Models\ViolationType;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('requires authentication to list violation types', function () {
    $this->getJson('/api/guard/violation-types')->assertStatus(401);
});

it('forbids admins from listing violation types', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $this->withHeaders(apiAs($admin))
        ->getJson('/api/guard/violation-types')
        ->assertStatus(403);
});

it('lists only active violation types ordered by name', function () {
    $guard = User::factory()->create(['role' => 'guard']);
    ViolationType::factory()->create(['name' => 'Improper Upper Garment']);
    ViolationType::factory()->create(['name' => 'Failure to Wear School ID']);
    ViolationType::factory()->inactive()->create(['name' => 'Hidden Type']);

    $this->withHeaders(apiAs($guard))
        ->getJson('/api/guard/violation-types')
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('data.0.name', 'Failure to Wear School ID')
        ->assertJsonPath('data.1.name', 'Improper Upper Garment')
        ->assertJsonMissing(['name' => 'Hidden Type']);
});

it('requires authentication to store a student violation', function () {
    $student = Student::factory()->create();

    $this->postJson("/api/guard/students/{$student->id}/violations")->assertStatus(401);
});

it('forbids admins from storing a student violation', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $student = Student::factory()->create();

    $this->withHeaders(apiAs($admin))
        ->postJson("/api/guard/students/{$student->id}/violations")
        ->assertStatus(403);
});

it('stores a student violation with multiple types and remarks', function () {
    $guard = User::factory()->create(['role' => 'guard', 'name' => 'Jose Guard']);
    $year = AcademicYear::factory()->active()->create();
    $student = Student::factory()->create(['academic_year_id' => $year->id]);
    $typeA = ViolationType::factory()->create();
    $typeB = ViolationType::factory()->create();

    $response = $this->withHeaders(apiAs($guard))
        ->postJson("/api/guard/students/{$student->id}/violations", [
            'violation_type_ids' => [$typeA->id, $typeB->id],
            'remarks' => 'Caught without ID at the gate.',
        ]);

    $response->assertCreated()
        ->assertJsonPath('data.student.id', $student->id)
        ->assertJsonPath('data.student.name', $student->full_name)
        ->assertJsonCount(2, 'data.violation_types')
        ->assertJsonPath('data.remarks', 'Caught without ID at the gate.')
        ->assertJsonPath('data.status', 'Non-compliant')
        ->assertJsonPath('data.recorded_by.name', 'Jose Guard');

    $violation = StudentViolation::query()->first();
    expect($violation->student_id)->toBe($student->id);
    expect($violation->violation_type_ids)->toBe([$typeA->id, $typeB->id]);
    expect($violation->remarks)->toBe('Caught without ID at the gate.');
    expect($violation->status)->toBe('Non-compliant');
    expect($violation->recorded_by)->toBe($guard->id);
});

it('stores a student violation without remarks', function () {
    $guard = User::factory()->create(['role' => 'guard']);
    $year = AcademicYear::factory()->active()->create();
    $student = Student::factory()->create(['academic_year_id' => $year->id]);
    $type = ViolationType::factory()->create();

    $this->withHeaders(apiAs($guard))
        ->postJson("/api/guard/students/{$student->id}/violations", [
            'violation_type_ids' => [$type->id],
        ])
        ->assertCreated()
        ->assertJsonPath('data.remarks', null);

    expect(StudentViolation::query()->first()->remarks)->toBeNull();
});

it('requires at least one violation type', function () {
    $guard = User::factory()->create(['role' => 'guard']);
    $year = AcademicYear::factory()->active()->create();
    $student = Student::factory()->create(['academic_year_id' => $year->id]);

    $this->withHeaders(apiAs($guard))
        ->postJson("/api/guard/students/{$student->id}/violations", [
            'violation_type_ids' => [],
        ])
        ->assertStatus(422)
        ->assertJsonValidationErrors('violation_type_ids');

    expect(StudentViolation::query()->count())->toBe(0);
});

it('rejects a violation type that does not exist', function () {
    $guard = User::factory()->create(['role' => 'guard']);
    $year = AcademicYear::factory()->active()->create();
    $student = Student::factory()->create(['academic_year_id' => $year->id]);

    $this->withHeaders(apiAs($guard))
        ->postJson("/api/guard/students/{$student->id}/violations", [
            'violation_type_ids' => [99999],
        ])
        ->assertStatus(422)
        ->assertJsonValidationErrors('violation_type_ids.0');

    expect(StudentViolation::query()->count())->toBe(0);
});

it('rejects violations for a student outside the active academic year', function () {
    $guard = User::factory()->create(['role' => 'guard']);
    AcademicYear::factory()->active()->create();
    $student = Student::factory()->create([
        'academic_year_id' => AcademicYear::factory()->inactive()->create()->id,
    ]);
    $type = ViolationType::factory()->create();

    $this->withHeaders(apiAs($guard))
        ->postJson("/api/guard/students/{$student->id}/violations", [
            'violation_type_ids' => [$type->id],
        ])
        ->assertStatus(409)
        ->assertJsonPath('message', 'Student does not belong to the active academic year.');

    expect(StudentViolation::query()->count())->toBe(0);
});
