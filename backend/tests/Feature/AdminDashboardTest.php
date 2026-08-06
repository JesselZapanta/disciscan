<?php

use App\Models\Student;
use App\Models\StudentTimeLog;
use App\Models\StudentViolation;
use App\Models\User;
use App\Models\ViolationType;
use App\Models\VisitorRegistration;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;

uses(RefreshDatabase::class);

it('returns dashboard aggregates for admins', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $guard = User::factory()->create(['role' => 'guard']);
    $type = ViolationType::factory()->create(['name' => 'Incomplete uniform']);

    $student = Student::factory()->create(['id_number' => '2610001', 'firstname' => 'Juan', 'middlename' => null, 'lastname' => 'Santos', 'extension' => null, 'program_and_year' => 'BSIT 2A']);

    StudentTimeLog::factory()->create(['student_id' => $student->id, 'type' => 'in', 'time' => Carbon::today()->setTime(8, 0), 'performed_by' => $guard->id]);
    StudentTimeLog::factory()->create(['student_id' => $student->id, 'type' => 'out', 'time' => Carbon::today()->setTime(17, 0), 'performed_by' => $guard->id]);

    StudentViolation::factory()->create(['student_id' => $student->id, 'violation_type_ids' => [$type->id], 'recorded_by' => $guard->id]);
    StudentViolation::factory()->create([
        'student_id' => $student->id,
        'violation_type_ids' => [$type->id],
        'status' => 'Resolved',
        'recorded_by' => $guard->id,
        'created_at' => Carbon::yesterday()->setTime(10, 0),
    ]);

    VisitorRegistration::factory()->create();

    $response = $this->withHeaders(apiAs($admin))
        ->getJson('/api/admin/dashboard')
        ->assertOk();

    expect($response->json('kpis.total_students'))->toBe(1);
    expect($response->json('kpis.present_today'))->toBe(1);
    expect($response->json('kpis.present_yesterday'))->toBe(0);
    expect($response->json('kpis.violations_today'))->toBe(1);
    expect($response->json('kpis.violations_yesterday'))->toBe(1);
    expect($response->json('kpis.pending_violations'))->toBe(1);
    expect($response->json('kpis.resolved_violations'))->toBe(1);
    expect($response->json('kpis.total_violations'))->toBe(2);
    expect($response->json('kpis.resolution_rate'))->toBe(50);
    expect($response->json('kpis.visitors_today'))->toBe(1);
    expect($response->json('kpis.visitors_yesterday'))->toBe(0);

    expect($response->json('series'))->toHaveCount(15);
    expect($response->json('series.14.date'))->toBe(Carbon::today()->toDateString());
    expect($response->json('series.14.checkins'))->toBe(1);
    expect($response->json('series.14.violations'))->toBe(1);
    expect($response->json('series.14.visitors'))->toBe(1);

    expect($response->json('top_violation_types.0.name'))->toBe('Incomplete uniform');
    expect($response->json('top_violation_types.0.count'))->toBe(2);
    expect($response->json('top_violation_types.0.pct'))->toBe(100);

    expect($response->json('top_offenders.0.name'))->toBe('Juan Santos');
    expect($response->json('top_offenders.0.count'))->toBe(1);
    expect($response->json('top_offenders.0.pct'))->toBe(100);
});

it('supports the days range filter on the dashboard series', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    VisitorRegistration::factory()->create(['created_at' => Carbon::today()->subDays(20)]);

    $response = $this->withHeaders(apiAs($admin))
        ->getJson('/api/admin/dashboard?days=30')
        ->assertOk();

    expect($response->json('series'))->toHaveCount(30);
    expect($response->json('series.0.date'))->toBe(Carbon::today()->subDays(29)->toDateString());
    expect($response->json('series.29.date'))->toBe(Carbon::today()->toDateString());
    expect(collect($response->json('series'))->sum('visitors'))->toBe(1);

    foreach ([60, 90] as $range) {
        $response = $this->withHeaders(apiAs($admin))
            ->getJson("/api/admin/dashboard?days={$range}")
            ->assertOk();

        expect($response->json('series'))->toHaveCount($range);
        expect(collect($response->json('series'))->sum('visitors'))->toBe(1);
    }

    $response = $this->withHeaders(apiAs($admin))
        ->getJson('/api/admin/dashboard?days=15')
        ->assertOk();

    expect($response->json('series'))->toHaveCount(15);
    expect(collect($response->json('series'))->sum('visitors'))->toBe(0);
});

it('falls back to 15 days for unsupported range values', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $this->withHeaders(apiAs($admin))
        ->getJson('/api/admin/dashboard?days=7')
        ->assertOk()
        ->assertJsonCount(15, 'series');

    $this->withHeaders(apiAs($admin))
        ->getJson('/api/admin/dashboard?days=120')
        ->assertOk()
        ->assertJsonCount(15, 'series');
});

it('forbids non-admins and guests from the dashboard', function () {
    $guard = User::factory()->create(['role' => 'guard']);

    $this->getJson('/api/admin/dashboard')->assertUnauthorized();

    $this->withHeaders(apiAs($guard))
        ->getJson('/api/admin/dashboard')
        ->assertForbidden();
});
