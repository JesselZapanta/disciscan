<?php

use App\Models\Room;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('lists rooms with search, building filter, status filter and pagination', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    Room::factory()->create(['room_name' => 'MB-212', 'building' => 'Main Building', 'status' => 'Active']);
    Room::factory()->create(['room_name' => 'AS-101', 'building' => 'Asenso Building', 'status' => 'Active']);
    Room::factory()->create(['room_name' => 'Computer Laboratory 1', 'building' => 'Main Building', 'status' => 'Inactive']);

    $this->withHeaders(apiAs($admin))
        ->getJson('/api/admin/rooms?search=MB-212')
        ->assertOk()
        ->assertJsonPath('meta.total', 1)
        ->assertJsonPath('data.0.room_name', 'MB-212')
        ->assertJsonPath('data.0.status', 'Active');

    $this->withHeaders(apiAs($admin))
        ->getJson('/api/admin/rooms?building=Asenso Building')
        ->assertOk()
        ->assertJsonPath('meta.total', 1)
        ->assertJsonPath('data.0.room_name', 'AS-101');

    $this->withHeaders(apiAs($admin))
        ->getJson('/api/admin/rooms?status=Inactive')
        ->assertOk()
        ->assertJsonPath('meta.total', 1)
        ->assertJsonPath('data.0.room_name', 'Computer Laboratory 1');
});

it('paginates rooms', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    Room::factory()->count(25)->create();

    $response = $this->withHeaders(apiAs($admin))
        ->getJson('/api/admin/rooms?per_page=10&page=2');

    $response->assertOk()
        ->assertJsonPath('meta.current_page', 2)
        ->assertJsonPath('meta.last_page', 3);

    expect(count($response->json('data')))->toBe(10);
});

it('sorts rooms by id descending by default and ascending on request', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $first = Room::factory()->create();
    $second = Room::factory()->create();
    $third = Room::factory()->create();

    $this->withHeaders(apiAs($admin))->getJson('/api/admin/rooms')
        ->assertOk()
        ->assertJsonPath('data.0.id', $third->id)
        ->assertJsonPath('data.1.id', $second->id)
        ->assertJsonPath('data.2.id', $first->id);

    $this->withHeaders(apiAs($admin))->getJson('/api/admin/rooms?sort_dir=asc')
        ->assertOk()
        ->assertJsonPath('data.0.id', $first->id)
        ->assertJsonPath('data.2.id', $third->id);
});

it('creates a room active by default', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $response = $this->withHeaders(apiAs($admin))->postJson('/api/admin/rooms', [
        'room_name' => 'MB-212',
        'building' => 'Main Building',
        'floor' => '2nd',
        'type' => 'Lecture Room',
    ]);

    $response->assertStatus(201)
        ->assertJsonPath('data.room_name', 'MB-212')
        ->assertJsonPath('data.building', 'Main Building')
        ->assertJsonPath('data.floor', '2nd')
        ->assertJsonPath('data.type', 'Lecture Room')
        ->assertJsonPath('data.status', 'Active');

    $this->assertDatabaseHas('rooms', [
        'room_name' => 'MB-212',
        'building' => 'Main Building',
        'status' => 'Active',
    ]);
});

it('creates an inactive room when requested', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $this->withHeaders(apiAs($admin))->postJson('/api/admin/rooms', [
        'room_name' => 'Faculty Office',
        'building' => 'Main Building',
        'floor' => '1st',
        'type' => 'Office',
        'status' => 'Inactive',
    ])->assertStatus(201)
        ->assertJsonPath('data.status', 'Inactive');
});

it('validates room creation payload', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $this->withHeaders(apiAs($admin))->postJson('/api/admin/rooms', [
        'room_name' => '',
        'building' => 'Not a building',
        'floor' => '4th',
        'type' => 'Garage',
        'status' => 'Maybe',
    ])->assertStatus(422)
        ->assertJsonValidationErrors(['room_name', 'building', 'floor', 'type', 'status']);
});

it('rejects duplicate room names in the same building', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    Room::factory()->create(['room_name' => 'MB-102', 'building' => 'Main Building']);

    $this->withHeaders(apiAs($admin))->postJson('/api/admin/rooms', [
        'room_name' => 'MB-102',
        'building' => 'Main Building',
        'floor' => '1st',
        'type' => 'Lecture Room',
    ])->assertStatus(422)
        ->assertJsonValidationErrors(['room_name']);
});

it('allows the same room name in a different building', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    Room::factory()->create(['room_name' => 'MB-102', 'building' => 'Main Building']);

    $this->withHeaders(apiAs($admin))->postJson('/api/admin/rooms', [
        'room_name' => 'MB-102',
        'building' => 'Asenso Building',
        'floor' => '1st',
        'type' => 'Lecture Room',
    ])->assertStatus(201);
});

it('updates a room', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $room = Room::factory()->create([
        'room_name' => 'Old Lab',
        'building' => 'Main Building',
        'floor' => '1st',
        'type' => 'Laboratory',
        'status' => 'Active',
    ]);

    $response = $this->withHeaders(apiAs($admin))->postJson("/api/admin/rooms/{$room->id}", [
        'room_name' => 'MB-212',
        'building' => 'Main Building',
        'floor' => '2nd',
        'type' => 'Lecture Room',
        'status' => 'Inactive',
    ]);

    $response->assertOk()
        ->assertJsonPath('data.room_name', 'MB-212')
        ->assertJsonPath('data.floor', '2nd')
        ->assertJsonPath('data.type', 'Lecture Room')
        ->assertJsonPath('data.status', 'Inactive');

    $room->refresh();
    $this->assertSame('Inactive', $room->status);
});

it('allows keeping the same room name on update', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $room = Room::factory()->create(['room_name' => 'MB-102', 'building' => 'Main Building']);

    $this->withHeaders(apiAs($admin))->postJson("/api/admin/rooms/{$room->id}", [
        'room_name' => 'MB-102',
        'building' => 'Main Building',
        'floor' => '1st',
        'type' => 'Lecture Room',
    ])->assertOk();
});

it('deletes a room', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $room = Room::factory()->create();

    $this->withHeaders(apiAs($admin))->deleteJson("/api/admin/rooms/{$room->id}")
        ->assertOk()
        ->assertJsonPath('message', 'Room deleted.');

    $this->assertDatabaseMissing('rooms', ['id' => $room->id]);
});

it('forbids non-admin users from managing rooms', function () {
    $guard = User::factory()->create(['role' => 'guard']);

    $this->withHeaders(apiAs($guard))->getJson('/api/admin/rooms')->assertStatus(403);
    $this->withHeaders(apiAs($guard))->postJson('/api/admin/rooms', ['room_name' => 'Test'])->assertStatus(403);
});
