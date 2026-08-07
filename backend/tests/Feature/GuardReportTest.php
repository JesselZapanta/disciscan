<?php

use App\Models\AcademicYear;
use App\Models\Compliance;
use App\Models\Room;
use App\Models\Student;
use App\Models\StudentTimeLog;
use App\Models\StudentViolation;
use App\Models\User;
use App\Models\ViolationType;
use App\Models\VisitorRegistration;
use App\Models\VisitorTimeLog;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function guardReporter(): User
{
    return User::factory()->create(['role' => 'guard']);
}

it('returns violation aggregates scoped to the guard', function () {
    $guard = guardReporter();
    $other = User::factory()->create(['role' => 'guard']);
    $type = ViolationType::factory()->create(['name' => 'Incomplete uniform']);
    $student = Student::factory()->create(['id_number' => '2610001', 'program_and_year' => 'BSIT 2A']);

    StudentViolation::factory()->create(['student_id' => $student->id, 'violation_type_ids' => [$type->id], 'status' => 'Non-compliant', 'recorded_by' => $guard->id, 'created_at' => now()->subDays(2)]);
    StudentViolation::factory()->create(['student_id' => $student->id, 'violation_type_ids' => [$type->id], 'status' => 'Resolved', 'recorded_by' => $guard->id, 'created_at' => now()->subDays(3)]);
    StudentViolation::factory()->create(['student_id' => $student->id, 'violation_type_ids' => [$type->id], 'recorded_by' => $other->id, 'created_at' => now()->subDays(2)]);

    $response = $this->withHeaders(apiAs($guard))
        ->getJson('/api/guard/reports/violations')
        ->assertOk();

    $kpis = collect($response->json('kpis'))->pluck('value', 'label');
    expect($kpis['Total Violations'])->toBe(2);
    expect($kpis['Resolved'])->toBe(1);
    expect($kpis['Non-compliant'])->toBe(1);
    expect($response->json('meta.title'))->toBe('Violations Report');
    expect($response->json('sections.2.rows'))->toHaveCount(2);
});

it('filters guard violations by category', function () {
    $guard = guardReporter();
    $uniform = ViolationType::factory()->create(['name' => 'Incomplete uniform']);
    $truancy = ViolationType::factory()->create(['name' => 'Truancy']);
    $student = Student::factory()->create();

    StudentViolation::factory()->create(['student_id' => $student->id, 'violation_type_ids' => [$uniform->id], 'recorded_by' => $guard->id, 'created_at' => now()->subDays(2)]);
    StudentViolation::factory()->create(['student_id' => $student->id, 'violation_type_ids' => [$truancy->id], 'recorded_by' => $guard->id, 'created_at' => now()->subDays(2)]);

    $this->withHeaders(apiAs($guard))
        ->getJson("/api/guard/reports/violations?category={$uniform->id}")
        ->assertOk()
        ->assertJsonPath('kpis.0.value', 1)
        ->assertJsonPath('sections.0.rows.0.0', 'Incomplete uniform');
});

it('respects date range filters on guard reports', function () {
    $guard = guardReporter();
    $student = Student::factory()->create();
    StudentViolation::factory()->create(['student_id' => $student->id, 'recorded_by' => $guard->id, 'created_at' => now()->subDays(45)]);

    $this->withHeaders(apiAs($guard))
        ->getJson('/api/guard/reports/violations?from='.now()->subDays(10)->format('Y-m-d').'&to='.now()->format('Y-m-d'))
        ->assertOk()
        ->assertJsonPath('kpis.0.value', 0);
});

it('returns attendance aggregates scoped to the guard', function () {
    $guard = guardReporter();
    $other = User::factory()->create(['role' => 'guard']);
    $student = Student::factory()->create();

    StudentTimeLog::factory()->create(['student_id' => $student->id, 'type' => 'in', 'time' => now()->subDays(1)->setTime(8, 0), 'performed_by' => $guard->id]);
    StudentTimeLog::factory()->create(['student_id' => $student->id, 'type' => 'out', 'time' => now()->subDays(1)->setTime(17, 0), 'performed_by' => $guard->id]);
    StudentTimeLog::factory()->create(['student_id' => $student->id, 'type' => 'in', 'time' => now()->subDays(1)->setTime(9, 0), 'performed_by' => $other->id]);

    $response = $this->withHeaders(apiAs($guard))
        ->getJson('/api/guard/reports/attendance')
        ->assertOk()
        ->assertJsonPath('kpis.0.value', 1)
        ->assertJsonPath('kpis.1.value', 1)
        ->assertJsonPath('sections.0.rows.0.1', 0)
        ->assertJsonPath('chart.points.0.ins', 0)
        ->assertJsonPath('chart.title', 'Daily Attendance');

    expect(count($response->json('sections')))->toBe(1);
});

it('returns visitor aggregates scoped to the guard', function () {
    $guard = guardReporter();
    $other = User::factory()->create(['role' => 'guard']);
    $mine = VisitorRegistration::factory()->create(['fullname' => 'Jane Doe', 'visit_date' => today(), 'status' => 'checked_in', 'purpose' => 'Meeting']);
    VisitorTimeLog::factory()->create(['visitor_registration_id' => $mine->id, 'type' => 'in', 'time' => now()->setTime(9, 0), 'performed_by' => $guard->id]);

    $theirs = VisitorRegistration::factory()->create(['fullname' => 'John Smith', 'visit_date' => today(), 'status' => 'pending']);
    VisitorTimeLog::factory()->create(['visitor_registration_id' => $theirs->id, 'type' => 'in', 'time' => now()->setTime(10, 0), 'performed_by' => $other->id]);

    $this->withHeaders(apiAs($guard))
        ->getJson('/api/guard/reports/visitors')
        ->assertOk()
        ->assertJsonPath('kpis.0.value', 1)
        ->assertJsonPath('kpis.2.value', 1)
        ->assertJsonPath('sections.2.rows.0.1', 'Jane Doe')
        ->assertJsonPath('sections.2.rows.0.6', '09:00 AM');
});

it('returns compliance aggregates scoped to the guard name', function () {
    $guard = guardReporter();
    $other = User::factory()->create(['role' => 'guard']);
    $room = Room::factory()->create(['room_name' => 'IT Lab 1', 'building' => 'Main Building']);
    Compliance::factory()->create(['room_id' => $room->id, 'issues' => 'Broken chair, Wet floor', 'status' => 'Non-Compliant', 'recorded_by' => $guard->name]);
    Compliance::factory()->create(['room_id' => $room->id, 'issues' => '', 'status' => 'Resolved', 'recorded_by' => $guard->name]);
    Compliance::factory()->create(['room_id' => $room->id, 'issues' => 'Damaged door', 'status' => 'Non-Compliant', 'recorded_by' => $other->name]);

    $response = $this->withHeaders(apiAs($guard))
        ->getJson('/api/guard/reports/compliance')
        ->assertOk()
        ->assertJsonPath('kpis.0.value', 2)
        ->assertJsonPath('kpis.1.value', 1);

    $issues = collect($response->json('sections.1.rows'))->pluck('0');
    expect($issues->all())->toContain('Broken chair')->toContain('Wet floor')->not->toContain('Damaged door');
});

it('returns executive aggregates scoped to the guard', function () {
    $guard = guardReporter();
    $other = User::factory()->create(['role' => 'guard']);
    $type = ViolationType::factory()->create(['name' => 'Incomplete uniform']);
    $student = Student::factory()->create([
        'id_number' => '2610001',
        'firstname' => 'Juan',
        'middlename' => 'Dela',
        'lastname' => 'Cruz',
        'extension' => null,
        'program_and_year' => 'BSIT 2A',
    ]);
    StudentViolation::factory()->create(['student_id' => $student->id, 'violation_type_ids' => [$type->id], 'recorded_by' => $guard->id, 'created_at' => now()->subDays(2)]);
    StudentViolation::factory()->create(['student_id' => $student->id, 'violation_type_ids' => [$type->id], 'recorded_by' => $other->id, 'created_at' => now()->subDays(2)]);
    $visitor = VisitorRegistration::factory()->create(['visit_date' => today(), 'status' => 'pending']);
    VisitorTimeLog::factory()->create(['visitor_registration_id' => $visitor->id, 'type' => 'in', 'time' => now()->setTime(9, 0), 'performed_by' => $guard->id]);
    StudentTimeLog::factory()->create(['student_id' => $student->id, 'type' => 'in', 'time' => now()->setTime(8, 0), 'performed_by' => $guard->id]);

    $response = $this->withHeaders(apiAs($guard))
        ->getJson('/api/guard/reports/summary')
        ->assertOk();

    $kpis = collect($response->json('kpis'))->pluck('value', 'label');
    expect($kpis['Check-ins'])->toBe(1);
    expect($kpis['Violations'])->toBe(1);
    expect($kpis['Visitors'])->toBe(1);
    expect($response->json('sections.1.rows.0.0'))->toBe('Juan Dela Cruz');
});

it('lists academic years for guards', function () {
    $guard = guardReporter();
    AcademicYear::factory()->create(['code' => '2025-2026', 'description' => 'SY 2025-2026']);

    $this->withHeaders(apiAs($guard))
        ->getJson('/api/guard/academic-years')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.code', '2025-2026');
});

it('rejects unknown report types', function () {
    $guard = guardReporter();

    $this->withHeaders(apiAs($guard))
        ->getJson('/api/guard/reports/unknown')
        ->assertNotFound();
});

it('denies non-guard access to guard reports', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $this->getJson('/api/guard/reports/summary')
        ->assertUnauthorized();

    $this->withHeaders(apiAs($admin))
        ->getJson('/api/guard/reports/summary')
        ->assertForbidden();
});
