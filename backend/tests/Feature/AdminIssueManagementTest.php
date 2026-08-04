<?php

use App\Models\Issue;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('lists issues with search, status filter and pagination', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    Issue::factory()->create(['name' => 'Lights left on', 'status' => 'Active']);
    Issue::factory()->create(['name' => 'Computers left on', 'status' => 'Active']);
    Issue::factory()->create(['name' => 'Equipment improperly used', 'status' => 'Inactive']);

    $this->withHeaders(apiAs($admin))
        ->getJson('/api/admin/issues?search=Lights')
        ->assertOk()
        ->assertJsonPath('meta.total', 1)
        ->assertJsonPath('data.0.name', 'Lights left on')
        ->assertJsonPath('data.0.status', 'Active');

    $this->withHeaders(apiAs($admin))
        ->getJson('/api/admin/issues?status=Inactive')
        ->assertOk()
        ->assertJsonPath('meta.total', 1)
        ->assertJsonPath('data.0.name', 'Equipment improperly used');
});

it('paginates issues', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    Issue::factory()->count(25)->create();

    $response = $this->withHeaders(apiAs($admin))
        ->getJson('/api/admin/issues?per_page=10&page=2');

    $response->assertOk()
        ->assertJsonPath('meta.current_page', 2)
        ->assertJsonPath('meta.last_page', 3);

    expect(count($response->json('data')))->toBe(10);
});

it('sorts issues by id descending by default and ascending on request', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $first = Issue::factory()->create();
    $second = Issue::factory()->create();
    $third = Issue::factory()->create();

    $this->withHeaders(apiAs($admin))->getJson('/api/admin/issues')
        ->assertOk()
        ->assertJsonPath('data.0.id', $third->id)
        ->assertJsonPath('data.1.id', $second->id)
        ->assertJsonPath('data.2.id', $first->id);

    $this->withHeaders(apiAs($admin))->getJson('/api/admin/issues?sort_dir=asc')
        ->assertOk()
        ->assertJsonPath('data.0.id', $first->id)
        ->assertJsonPath('data.2.id', $third->id);
});

it('creates an issue active by default', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $response = $this->withHeaders(apiAs($admin))->postJson('/api/admin/issues', [
        'name' => 'Aircon left on',
        'description' => 'Air conditioning unit left running.',
    ]);

    $response->assertStatus(201)
        ->assertJsonPath('data.name', 'Aircon left on')
        ->assertJsonPath('data.description', 'Air conditioning unit left running.')
        ->assertJsonPath('data.status', 'Active');

    $this->assertDatabaseHas('issues', [
        'name' => 'Aircon left on',
        'status' => 'Active',
    ]);
});

it('creates an issue with a requested status', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $this->withHeaders(apiAs($admin))->postJson('/api/admin/issues', [
        'name' => 'Broken chair',
        'description' => 'Damaged furniture in the lecture room.',
        'status' => 'Inactive',
    ])->assertStatus(201)
        ->assertJsonPath('data.status', 'Inactive');
});

it('validates issue creation payload', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $this->withHeaders(apiAs($admin))->postJson('/api/admin/issues', [
        'name' => '',
        'description' => '',
        'status' => 'Maybe',
    ])->assertStatus(422)
        ->assertJsonValidationErrors(['name', 'description', 'status']);
});

it('rejects duplicate issue names', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    Issue::factory()->create(['name' => 'Lights left on']);

    $this->withHeaders(apiAs($admin))->postJson('/api/admin/issues', [
        'name' => 'Lights left on',
        'description' => 'Duplicate.',
    ])->assertStatus(422)
        ->assertJsonValidationErrors(['name']);
});

it('updates an issue', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $issue = Issue::factory()->create([
        'name' => 'Old issue',
        'description' => 'Old description',
        'status' => 'Active',
    ]);

    $response = $this->withHeaders(apiAs($admin))->postJson("/api/admin/issues/{$issue->id}", [
        'name' => 'Windows not locked',
        'description' => 'Windows left open overnight.',
        'status' => 'Inactive',
    ]);

    $response->assertOk()
        ->assertJsonPath('data.name', 'Windows not locked')
        ->assertJsonPath('data.description', 'Windows left open overnight.')
        ->assertJsonPath('data.status', 'Inactive');

    $issue->refresh();
    $this->assertSame('Inactive', $issue->status);
});

it('allows keeping the same issue name on update', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $issue = Issue::factory()->create(['name' => 'Lights left on']);

    $this->withHeaders(apiAs($admin))->postJson("/api/admin/issues/{$issue->id}", [
        'name' => 'Lights left on',
        'description' => 'Still the same.',
    ])->assertOk();
});

it('deletes an issue', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $issue = Issue::factory()->create();

    $this->withHeaders(apiAs($admin))->deleteJson("/api/admin/issues/{$issue->id}")
        ->assertOk()
        ->assertJsonPath('message', 'Issue deleted.');

    $this->assertDatabaseMissing('issues', ['id' => $issue->id]);
});

it('forbids non-admin users from managing issues', function () {
    $guard = User::factory()->create(['role' => 'guard']);

    $this->withHeaders(apiAs($guard))->getJson('/api/admin/issues')->assertStatus(403);
    $this->withHeaders(apiAs($guard))->postJson('/api/admin/issues', ['name' => 'Test'])->assertStatus(403);
});
