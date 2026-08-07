<?php

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

function reportAdmin(): User
{
    return User::factory()->create(['role' => 'admin']);
}

it('returns violation aggregates for the violations report', function () {
    $admin = reportAdmin();
    $type = ViolationType::factory()->create(['name' => 'Incomplete uniform']);
    $student = Student::factory()->create(['id_number' => '2610001', 'program_and_year' => 'BSIT 2A']);

    StudentViolation::factory()->create(['student_id' => $student->id, 'violation_type_ids' => [$type->id], 'status' => 'Non-compliant', 'created_at' => now()->subDays(2)]);
    StudentViolation::factory()->create(['student_id' => $student->id, 'violation_type_ids' => [$type->id], 'status' => 'Resolved', 'created_at' => now()->subDays(3)]);

    $response = $this->withHeaders(apiAs($admin))
        ->getJson('/api/admin/reports/violations')
        ->assertOk();

    $kpis = collect($response->json('kpis'))->pluck('value', 'label');
    expect($kpis['Total Violations'])->toBe(2);
    expect($kpis['Resolved'])->toBe(1);
    expect($kpis['Non-compliant'])->toBe(1);
    expect($response->json('meta.title'))->toBe('Violations Report');
    expect($response->json('sections.2.rows'))->toHaveCount(2);
});

it('filters violations by category', function () {
    $admin = reportAdmin();
    $uniform = ViolationType::factory()->create(['name' => 'Incomplete uniform']);
    $truancy = ViolationType::factory()->create(['name' => 'Truancy']);
    $student = Student::factory()->create();

    StudentViolation::factory()->create(['student_id' => $student->id, 'violation_type_ids' => [$uniform->id], 'created_at' => now()->subDays(2)]);
    StudentViolation::factory()->create(['student_id' => $student->id, 'violation_type_ids' => [$truancy->id], 'created_at' => now()->subDays(2)]);

    $this->withHeaders(apiAs($admin))
        ->getJson("/api/admin/reports/violations?category={$uniform->id}")
        ->assertOk()
        ->assertJsonPath('kpis.0.value', 1)
        ->assertJsonPath('sections.0.rows.0.0', 'Incomplete uniform');
});

it('respects date range filters on reports', function () {
    $admin = reportAdmin();
    $student = Student::factory()->create();
    StudentViolation::factory()->create(['student_id' => $student->id, 'created_at' => now()->subDays(45)]);

    $this->withHeaders(apiAs($admin))
        ->getJson('/api/admin/reports/violations?from='.now()->subDays(10)->format('Y-m-d').'&to='.now()->format('Y-m-d'))
        ->assertOk()
        ->assertJsonPath('kpis.0.value', 0);
});

it('returns attendance aggregates for the attendance report', function () {
    $admin = reportAdmin();
    $student = Student::factory()->create([
        'id_number' => '2610001',
        'firstname' => 'Juan',
        'middlename' => 'Dela',
        'lastname' => 'Cruz',
        'extension' => null,
        'program_and_year' => 'BSIT 2A',
    ]);
    StudentTimeLog::factory()->create(['student_id' => $student->id, 'type' => 'in', 'time' => now()->subDays(1)->setTime(8, 0)]);
    StudentTimeLog::factory()->create(['student_id' => $student->id, 'type' => 'out', 'time' => now()->subDays(1)->setTime(17, 0)]);

    $response = $this->withHeaders(apiAs($admin))
        ->getJson('/api/admin/reports/attendance')
        ->assertOk()
        ->assertJsonPath('kpis.0.value', 1)
        ->assertJsonPath('kpis.1.value', 1)
        ->assertJsonPath('sections.0.rows.0.1', 0)
        ->assertJsonPath('chart.points.0.ins', 0)
        ->assertJsonPath('chart.title', 'Daily Attendance');

    expect(count($response->json('sections')))->toBe(1);
});

it('returns visitor aggregates for the visitors report', function () {
    $admin = reportAdmin();
    $visitor = VisitorRegistration::factory()->create(['fullname' => 'Jane Doe', 'visit_date' => today(), 'status' => 'checked_in', 'purpose' => 'Meeting']);
    VisitorTimeLog::factory()->create(['visitor_registration_id' => $visitor->id, 'type' => 'in', 'time' => now()->setTime(9, 0)]);

    $this->withHeaders(apiAs($admin))
        ->getJson('/api/admin/reports/visitors')
        ->assertOk()
        ->assertJsonPath('kpis.0.value', 1)
        ->assertJsonPath('kpis.2.value', 1)
        ->assertJsonPath('sections.2.rows.0.1', 'Jane Doe')
        ->assertJsonPath('sections.2.rows.0.6', '09:00 AM');
});

it('returns compliance aggregates for the compliance report', function () {
    $admin = reportAdmin();
    $room = Room::factory()->create(['room_name' => 'IT Lab 1', 'building' => 'Main Building']);
    Compliance::factory()->create(['room_id' => $room->id, 'issues' => 'Broken chair, Wet floor', 'status' => 'Non-Compliant', 'recorded_by' => 'Guard A']);
    Compliance::factory()->create(['room_id' => $room->id, 'issues' => '', 'status' => 'Resolved', 'recorded_by' => 'Guard A']);

    $this->withHeaders(apiAs($admin))
        ->getJson('/api/admin/reports/compliance')
        ->assertOk()
        ->assertJsonPath('kpis.0.value', 2)
        ->assertJsonPath('kpis.1.value', 1)
        ->assertJsonPath('sections.1.rows.0.0', 'Broken chair');
});

it('returns executive aggregates for the summary report', function () {
    $admin = reportAdmin();
    $type = ViolationType::factory()->create(['name' => 'Incomplete uniform']);
    $student = Student::factory()->create([
        'id_number' => '2610001',
        'firstname' => 'Juan',
        'middlename' => 'Dela',
        'lastname' => 'Cruz',
        'extension' => null,
        'program_and_year' => 'BSIT 2A',
    ]);
    StudentViolation::factory()->create(['student_id' => $student->id, 'violation_type_ids' => [$type->id], 'created_at' => now()->subDays(2)]);
    VisitorRegistration::factory()->create(['visit_date' => today(), 'status' => 'pending']);
    StudentTimeLog::factory()->create(['student_id' => $student->id, 'type' => 'in', 'time' => now()->setTime(8, 0)]);

    $response = $this->withHeaders(apiAs($admin))
        ->getJson('/api/admin/reports/summary')
        ->assertOk();

    $kpis = collect($response->json('kpis'))->pluck('value', 'label');
    expect($kpis['Enrolled Students'])->toBe(1);
    expect($kpis['Check-ins'])->toBe(1);
    expect($kpis['Violations'])->toBe(1);
    expect($kpis['Visitors'])->toBe(1);
    expect($response->json('sections.1.rows.0.0'))->toBe('Juan Dela Cruz');
});

it('no longer exposes the server-side pdf endpoint (browser print only)', function () {
    $admin = reportAdmin();

    $this->withHeaders(apiAs($admin))
        ->getJson('/api/admin/reports/summary/pdf')
        ->assertNotFound();
});

it('rejects unknown report types', function () {
    $admin = reportAdmin();

    $this->withHeaders(apiAs($admin))
        ->getJson('/api/admin/reports/unknown')
        ->assertNotFound();
});

it('denies non-admin access to reports', function () {
    $guard = User::factory()->create(['role' => 'guard']);

    $this->getJson('/api/admin/reports/summary')
        ->assertUnauthorized();

    $this->withHeaders(apiAs($guard))
        ->getJson('/api/admin/reports/summary')
        ->assertForbidden();
});
