<?php

use App\Models\Student;
use App\Models\StudentTimeLog;
use App\Models\StudentViolation;
use App\Models\User;
use App\Models\ViolationType;
use App\Models\VisitorRegistration;
use App\Models\VisitorTimeLog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;

uses(RefreshDatabase::class);

it('returns scan-focused dashboard aggregates for guards', function () {
    $guard = User::factory()->create(['role' => 'guard']);
    $type = ViolationType::factory()->create(['name' => 'Incomplete uniform']);

    $student = Student::factory()->create(['id_number' => '2610001', 'firstname' => 'Juan', 'middlename' => null, 'lastname' => 'Santos', 'extension' => null, 'program_and_year' => 'BSIT 2A']);

    StudentTimeLog::factory()->create(['student_id' => $student->id, 'type' => 'in', 'time' => Carbon::today()->setTime(8, 0), 'performed_by' => $guard->id]);
    StudentViolation::factory()->create([
        'student_id' => $student->id,
        'violation_type_ids' => [$type->id],
        'recorded_by' => $guard->id,
        'created_at' => Carbon::today()->setTime(10, 0),
    ]);
    $visitor = VisitorRegistration::factory()->create(['fullname' => 'Jane Doe']);
    VisitorTimeLog::factory()->create(['visitor_registration_id' => $visitor->id, 'type' => 'in', 'time' => Carbon::today()->setTime(9, 0), 'performed_by' => $guard->id]);

    $response = $this->withHeaders(apiAs($guard))
        ->getJson('/api/guard/dashboard')
        ->assertOk();

    expect($response->json('kpis.scans_today'))->toBe(1);
    expect($response->json('kpis.scans_yesterday'))->toBe(0);
    expect($response->json('kpis.visitors_today'))->toBe(1);
    expect($response->json('kpis.visitors_yesterday'))->toBe(0);
    expect($response->json('kpis.violations_today'))->toBe(1);
    expect($response->json('kpis.violations_yesterday'))->toBe(0);
    expect($response->json('kpis.pending_violations'))->toBe(1);
    expect($response->json('kpis.resolved_violations'))->toBe(0);
    expect($response->json('kpis.total_violations'))->toBe(1);
    expect($response->json('kpis.resolution_rate'))->toBe(0);

    expect($response->json('series'))->toHaveCount(15);
    expect($response->json('series.14.date'))->toBe(Carbon::today()->toDateString());
    expect($response->json('series.14.checkins'))->toBe(1);
    expect($response->json('series.14.violations'))->toBe(1);
    expect($response->json('series.14.visitors'))->toBe(1);

    $scans = collect($response->json('recent_scans'));
    expect($scans)->toHaveCount(3);
    expect($scans->where('type', 'Time-in recorded')->count())->toBe(1);
    expect($scans->where('type', 'Incomplete uniform')->count())->toBe(1);
    expect($scans->where('type', 'Visitor entry logged')->count())->toBe(1);
    expect($scans->first()['name'])->toBe('Juan Santos');
});

it('supports the days range filter on the guard dashboard series', function () {
    $guard = User::factory()->create(['role' => 'guard']);

    $response = $this->withHeaders(apiAs($guard))
        ->getJson('/api/guard/dashboard?days=30')
        ->assertOk();

    expect($response->json('series'))->toHaveCount(30);
    expect($response->json('series.29.date'))->toBe(Carbon::today()->toDateString());
});

it('forbids admins and guests from the guard dashboard', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $this->getJson('/api/guard/dashboard')->assertUnauthorized();

    $this->withHeaders(apiAs($admin))
        ->getJson('/api/guard/dashboard')
        ->assertForbidden();
});
