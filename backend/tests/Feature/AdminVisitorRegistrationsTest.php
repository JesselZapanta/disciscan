<?php

use App\Models\User;
use App\Models\VisitorRegistration;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('requires authentication to list visitor registrations', function () {
    $this->getJson('/api/admin/visitor-registrations')->assertStatus(401);
});

it('forbids guards from listing visitor registrations', function () {
    $guard = User::factory()->create(['role' => 'guard']);

    $this->withHeaders(apiAs($guard))
        ->getJson('/api/admin/visitor-registrations')
        ->assertStatus(403);
});

it('lists visitor registrations with record numbers for admins', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $registration = VisitorRegistration::factory()->create([
        'fullname' => 'Juan Dela Cruz',
        'contact' => '09171234567',
        'status' => 'pending',
    ]);

    $response = $this->withHeaders(apiAs($admin))
        ->getJson('/api/admin/visitor-registrations');

    $response->assertOk()
        ->assertJsonPath('meta.total', 1)
        ->assertJsonPath('data.0.id', $registration->id)
        ->assertJsonPath('data.0.record_no', 'VIS-'.str_pad((string) $registration->id, 5, '0', STR_PAD_LEFT))
        ->assertJsonPath('data.0.fullname', 'Juan Dela Cruz')
        ->assertJsonPath('data.0.status', 'pending')
        ->assertJsonStructure(['data' => [['id', 'record_no', 'fullname', 'contact', 'purpose', 'visit_date', 'status']]]);
});

it('searches visitor registrations by name or contact', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    VisitorRegistration::factory()->create(['fullname' => 'Maria Santos', 'contact' => '09171111111']);
    VisitorRegistration::factory()->create(['fullname' => 'Juan Dela Cruz', 'contact' => '09171234567']);

    $response = $this->withHeaders(apiAs($admin))
        ->getJson('/api/admin/visitor-registrations?search=santos');

    $response->assertOk()
        ->assertJsonPath('meta.total', 1)
        ->assertJsonPath('data.0.fullname', 'Maria Santos');

    $this->withHeaders(apiAs($admin))
        ->getJson('/api/admin/visitor-registrations?search=09171234567')
        ->assertOk()
        ->assertJsonPath('meta.total', 1)
        ->assertJsonPath('data.0.contact', '09171234567');
});

it('filters visitor registrations by status', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    VisitorRegistration::factory()->create(['status' => 'pending']);
    VisitorRegistration::factory()->create(['status' => 'checked_in']);
    VisitorRegistration::factory()->create(['status' => 'checked_out']);

    $response = $this->withHeaders(apiAs($admin))
        ->getJson('/api/admin/visitor-registrations?status=checked_in');

    $response->assertOk()
        ->assertJsonPath('meta.total', 1)
        ->assertJsonPath('data.0.status', 'checked_in');
});

it('paginates visitor registrations', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    VisitorRegistration::factory()->count(25)->create();

    $response = $this->withHeaders(apiAs($admin))
        ->getJson('/api/admin/visitor-registrations?per_page=10&page=2');

    $response->assertOk()
        ->assertJsonPath('meta.current_page', 2)
        ->assertJsonPath('meta.per_page', 10)
        ->assertJsonPath('meta.last_page', 3);

    expect(count($response->json('data')))->toBe(10);
});
