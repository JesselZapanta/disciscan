<?php

use App\Models\StudentViolation;
use App\Models\User;
use App\Models\ViolationType;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('lists violation types with search, status filter and pagination', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    ViolationType::factory()->create(['name' => 'Incomplete uniform', 'description' => 'Uniform pieces missing.', 'is_active' => true]);
    ViolationType::factory()->create(['name' => 'Bullying', 'description' => 'Aggressive behavior.', 'is_active' => true]);
    ViolationType::factory()->create(['name' => 'Vandalism', 'description' => 'Defacing property.', 'is_active' => false]);

    $response = $this->withHeaders(apiAs($admin))
        ->getJson('/api/admin/violation-types?search=uniform&status=active&per_page=10');

    $response->assertOk()
        ->assertJsonPath('meta.total', 1)
        ->assertJsonPath('data.0.name', 'Incomplete uniform')
        ->assertJsonPath('data.0.is_active', true);
});

it('paginates violation types', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    ViolationType::factory()->count(25)->create();

    $response = $this->withHeaders(apiAs($admin))
        ->getJson('/api/admin/violation-types?per_page=10&page=2');

    $response->assertOk()
        ->assertJsonPath('meta.current_page', 2)
        ->assertJsonPath('meta.last_page', 3);

    expect(count($response->json('data')))->toBe(10);
});

it('sorts by id descending by default and ascending on request', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $first = ViolationType::factory()->create();
    $second = ViolationType::factory()->create();
    $third = ViolationType::factory()->create();

    $this->withHeaders(apiAs($admin))->getJson('/api/admin/violation-types')
        ->assertOk()
        ->assertJsonPath('data.0.id', $third->id)
        ->assertJsonPath('data.1.id', $second->id)
        ->assertJsonPath('data.2.id', $first->id);

    $this->withHeaders(apiAs($admin))->getJson('/api/admin/violation-types?sort_dir=asc')
        ->assertOk()
        ->assertJsonPath('data.0.id', $first->id)
        ->assertJsonPath('data.2.id', $third->id);
});

it('creates a violation type active by default', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $response = $this->withHeaders(apiAs($admin))->postJson('/api/admin/violation-types', [
        'name' => 'Incomplete uniform',
        'description' => 'Uniform pieces missing.',
    ]);

    $response->assertStatus(201)
        ->assertJsonPath('data.name', 'Incomplete uniform')
        ->assertJsonPath('data.is_active', true);

    $this->assertDatabaseHas('violation_types', ['name' => 'Incomplete uniform', 'is_active' => true]);
});

it('creates an inactive violation type when requested', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $this->withHeaders(apiAs($admin))->postJson('/api/admin/violation-types', [
        'name' => 'Smoking within campus',
        'is_active' => false,
    ])->assertStatus(201)
        ->assertJsonPath('data.is_active', false);
});

it('validates creation payload', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $this->withHeaders(apiAs($admin))->postJson('/api/admin/violation-types', [
        'name' => '',
        'description' => str_repeat('a', 1001),
    ])->assertStatus(422)
        ->assertJsonValidationErrors(['name', 'description']);
});

it('rejects duplicate violation type names', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    ViolationType::factory()->create(['name' => 'Vandalism']);

    $this->withHeaders(apiAs($admin))->postJson('/api/admin/violation-types', [
        'name' => 'Vandalism',
    ])->assertStatus(422)
        ->assertJsonValidationErrors(['name']);
});

it('updates a violation type', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $type = ViolationType::factory()->create(['name' => 'Old name', 'is_active' => true]);

    $response = $this->withHeaders(apiAs($admin))->postJson("/api/admin/violation-types/{$type->id}", [
        'name' => 'New name',
        'description' => 'Updated description',
        'is_active' => false,
    ]);

    $response->assertOk()
        ->assertJsonPath('data.name', 'New name')
        ->assertJsonPath('data.description', 'Updated description')
        ->assertJsonPath('data.is_active', false);

    $type->refresh();
    $this->assertFalse($type->is_active);
});

it('allows keeping the same name on update', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $type = ViolationType::factory()->create(['name' => 'Vandalism']);

    $this->withHeaders(apiAs($admin))->postJson("/api/admin/violation-types/{$type->id}", [
        'name' => 'Vandalism',
    ])->assertOk();
});

it('deletes a violation type', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $type = ViolationType::factory()->create();

    $this->withHeaders(apiAs($admin))->deleteJson("/api/admin/violation-types/{$type->id}")
        ->assertOk()
        ->assertJsonPath('message', 'Violation type deleted.');

    $this->assertDatabaseMissing('violation_types', ['id' => $type->id]);
});

it('blocks deleting a violation type used by violation records', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $type = ViolationType::factory()->create();

    StudentViolation::factory()->create(['violation_type_ids' => [$type->id]]);

    $this->withHeaders(apiAs($admin))->deleteJson("/api/admin/violation-types/{$type->id}")
        ->assertStatus(422)
        ->assertJsonValidationErrors(['status']);

    $this->assertDatabaseHas('violation_types', ['id' => $type->id]);
});

it('forbids non-admin users from managing violation types', function () {
    $guard = User::factory()->create(['role' => 'guard']);

    $this->withHeaders(apiAs($guard))->getJson('/api/admin/violation-types')->assertStatus(403);
    $this->withHeaders(apiAs($guard))->postJson('/api/admin/violation-types', ['name' => 'Test'])->assertStatus(403);
});
