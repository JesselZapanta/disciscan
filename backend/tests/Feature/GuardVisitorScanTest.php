<?php

use App\Models\User;
use App\Models\VisitorRegistration;
use App\Models\VisitorTimeLog;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('requires authentication to look up a visitor', function () {
    $this->getJson('/api/guard/visitors/lookup/VIS-00001')->assertStatus(401);
});

it('forbids admins from using the guard scan endpoints', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $this->withHeaders(apiAs($admin))
        ->getJson('/api/guard/visitors/lookup/VIS-00001')
        ->assertStatus(403);
});

it('looks up a visitor by record number', function () {
    $guard = User::factory()->create(['role' => 'guard']);
    $visitor = VisitorRegistration::factory()->create([
        'fullname' => 'Liza Soberano',
        'type' => 'student',
        'status' => 'pending',
    ]);
    $recordNo = 'VIS-'.str_pad((string) $visitor->id, 5, '0', STR_PAD_LEFT);

    $this->withHeaders(apiAs($guard))
        ->getJson("/api/guard/visitors/lookup/{$recordNo}")
        ->assertOk()
        ->assertJsonPath('data.id', $visitor->id)
        ->assertJsonPath('data.record_no', $recordNo)
        ->assertJsonPath('data.fullname', 'Liza Soberano')
        ->assertJsonPath('data.type', 'student')
        ->assertJsonPath('data.status', 'pending')
        ->assertJsonPath('data.checked_in_at', null)
        ->assertJsonPath('data.checked_out_at', null);
});

it('looks up a visitor by numeric id', function () {
    $guard = User::factory()->create(['role' => 'guard']);
    $visitor = VisitorRegistration::factory()->create();

    $this->withHeaders(apiAs($guard))
        ->getJson("/api/guard/visitors/lookup/{$visitor->id}")
        ->assertOk()
        ->assertJsonPath('data.id', $visitor->id);
});

it('returns 404 for an unknown visitor', function () {
    $guard = User::factory()->create(['role' => 'guard']);

    $this->withHeaders(apiAs($guard))
        ->getJson('/api/guard/visitors/lookup/VIS-99999')
        ->assertStatus(404)
        ->assertJsonPath('message', 'Visitor not found.');
});

it('returns 422 for an invalid record number format', function () {
    $guard = User::factory()->create(['role' => 'guard']);

    $this->withHeaders(apiAs($guard))
        ->getJson('/api/guard/visitors/lookup/NOT-A-VIS')
        ->assertStatus(422);
});

it('checks in a pending visitor and records the time log', function () {
    $guard = User::factory()->create(['role' => 'guard', 'name' => 'Jose Guard']);
    $visitor = VisitorRegistration::factory()->create(['type' => 'visitor', 'status' => 'pending']);

    $response = $this->withHeaders(apiAs($guard))
        ->postJson("/api/guard/visitors/{$visitor->id}/check-in");

    $response->assertOk()
        ->assertJsonPath('data.status', 'checked_in')
        ->assertJsonPath('data.checked_in_by.name', 'Jose Guard')
        ->assertJsonPath('data.time_logs.0.type', 'in')
        ->assertJsonPath('data.time_logs.0.performed_by.name', 'Jose Guard');

    expect(data_get($response->json(), 'data.checked_in_at'))->not->toBeNull();
    expect(data_get($response->json(), 'data.time_logs.0.time'))->not->toBeNull();

    expect(VisitorTimeLog::query()->where('visitor_registration_id', $visitor->id)->count())->toBe(1);

    $log = VisitorTimeLog::query()->where('visitor_registration_id', $visitor->id)->first();
    expect($log->type)->toBe('in');
    expect($log->performed_by)->toBe($guard->id);
    expect($log->time)->not->toBeNull();
});

it('rejects a second check-in while already checked in', function () {
    $guard = User::factory()->create(['role' => 'guard']);
    $visitor = VisitorRegistration::factory()->create(['status' => 'checked_in']);

    $this->withHeaders(apiAs($guard))
        ->postJson("/api/guard/visitors/{$visitor->id}/check-in")
        ->assertStatus(409)
        ->assertJsonPath('message', 'Visitor is already checked in.');
});

it('checks out a checked-in visitor and records the time log', function () {
    $guard = User::factory()->create(['role' => 'guard', 'name' => 'Jose Guard']);
    $visitor = VisitorRegistration::factory()->create(['type' => 'visitor', 'status' => 'checked_in']);

    $response = $this->withHeaders(apiAs($guard))
        ->postJson("/api/guard/visitors/{$visitor->id}/check-out");

    $response->assertOk()
        ->assertJsonPath('data.status', 'checked_out')
        ->assertJsonPath('data.checked_out_by.name', 'Jose Guard')
        ->assertJsonPath('data.time_logs.0.type', 'out')
        ->assertJsonPath('data.time_logs.0.performed_by.name', 'Jose Guard');

    expect(data_get($response->json(), 'data.checked_out_at'))->not->toBeNull();
    expect(data_get($response->json(), 'data.time_logs.0.time'))->not->toBeNull();

    $log = VisitorTimeLog::query()->where('visitor_registration_id', $visitor->id)->first();
    expect($log->type)->toBe('out');
    expect($log->performed_by)->toBe($guard->id);
    expect($log->time)->not->toBeNull();
});

it('rejects checkout when the visitor is not checked in', function () {
    $guard = User::factory()->create(['role' => 'guard']);
    $visitor = VisitorRegistration::factory()->create(['status' => 'pending']);

    $this->withHeaders(apiAs($guard))
        ->postJson("/api/guard/visitors/{$visitor->id}/check-out")
        ->assertStatus(409)
        ->assertJsonPath('message', 'Visitor must be checked in before checking out.');
});

it('rejects a second checkout', function () {
    $guard = User::factory()->create(['role' => 'guard']);
    $visitor = VisitorRegistration::factory()->create(['status' => 'checked_out']);

    $this->withHeaders(apiAs($guard))
        ->postJson("/api/guard/visitors/{$visitor->id}/check-out")
        ->assertStatus(409);
});

it('allows re-entry check-in after checkout', function () {
    $guard = User::factory()->create(['role' => 'guard', 'name' => 'Jose Guard']);
    $visitor = VisitorRegistration::factory()->create(['type' => 'visitor', 'status' => 'pending']);

    $this->withHeaders(apiAs($guard))
        ->postJson("/api/guard/visitors/{$visitor->id}/check-in")
        ->assertOk()
        ->assertJsonPath('data.status', 'checked_in');

    $this->withHeaders(apiAs($guard))
        ->postJson("/api/guard/visitors/{$visitor->id}/check-out")
        ->assertOk()
        ->assertJsonPath('data.status', 'checked_out');

    $this->withHeaders(apiAs($guard))
        ->postJson("/api/guard/visitors/{$visitor->id}/check-in")
        ->assertOk()
        ->assertJsonPath('data.status', 'checked_in');

    $logs = VisitorTimeLog::query()->where('visitor_registration_id', $visitor->id)->orderBy('id')->get();
    expect($logs->pluck('type')->all())->toBe(['in', 'out', 'in']);
});

it('allows a guard to update visitor details', function () {
    $guard = User::factory()->create(['role' => 'guard', 'name' => 'Jose Guard']);
    $visitor = VisitorRegistration::factory()->create([
        'fullname' => 'Old Name',
        'contact' => '09171234567',
        'status' => 'pending',
    ]);

    $this->withHeaders(apiAs($guard))
        ->putJson("/api/guard/visitors/{$visitor->id}", [
            'fullname' => 'New Name',
            'contact' => '09170000001',
            'purpose' => 'Meeting with faculty/staff',
            'person_office_to_visit' => "Registrar's Office",
            'id_type' => 'National ID',
            'id_number' => '1234-5678',
            'visit_date' => '2026-08-02',
        ])
        ->assertOk()
        ->assertJsonPath('data.fullname', 'New Name')
        ->assertJsonPath('data.contact', '09170000001')
        ->assertJsonPath('data.purpose', 'Meeting with faculty/staff')
        ->assertJsonPath('data.person_office_to_visit', "Registrar's Office")
        ->assertJsonPath('data.id_type', 'National ID')
        ->assertJsonPath('data.id_number', '1234-5678')
        ->assertJsonPath('data.visit_date', '2026-08-02')
        ->assertJsonPath('data.status', 'pending');
});

it('returns 422 when a guard updates with invalid details', function () {
    $guard = User::factory()->create(['role' => 'guard']);
    $visitor = VisitorRegistration::factory()->create(['contact' => '09171234567']);

    $this->withHeaders(apiAs($guard))
        ->putJson("/api/guard/visitors/{$visitor->id}", [
            'fullname' => '',
            'contact' => 'not-a-phone',
            'purpose' => 'Nope',
            'person_office_to_visit' => '',
            'id_type' => 'Nope',
            'id_number' => '',
            'visit_date' => 'not-a-date',
        ])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['fullname', 'contact', 'purpose', 'person_office_to_visit', 'id_type', 'id_number', 'visit_date']);
});

it('ignores its own contact when validating uniqueness on update', function () {
    $guard = User::factory()->create(['role' => 'guard']);
    $visitor = VisitorRegistration::factory()->create([
        'contact' => '09171234567',
        'visit_date' => '2026-08-01',
        'status' => 'checked_in',
    ]);

    $this->withHeaders(apiAs($guard))
        ->putJson("/api/guard/visitors/{$visitor->id}", [
            'fullname' => 'Updated Name',
            'contact' => '09171234567',
            'purpose' => 'Meeting with faculty/staff',
            'person_office_to_visit' => "Registrar's Office",
            'id_type' => 'National ID',
            'id_number' => '1234',
            'visit_date' => '2026-08-01',
        ])
        ->assertOk()
        ->assertJsonPath('data.fullname', 'Updated Name')
        ->assertJsonPath('data.status', 'checked_in');
});
