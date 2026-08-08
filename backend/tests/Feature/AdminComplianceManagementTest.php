<?php

use App\Models\Compliance;
use App\Models\Room;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;

uses(RefreshDatabase::class);

it('lists compliances with room search, status filter and pagination', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $room = Room::factory()->create(['room_name' => 'MB-212']);
    $otherRoom = Room::factory()->create(['room_name' => 'AS-101']);

    Compliance::factory()->create([
        'room_id' => $room->id,
        'issues' => 'Lights left on',
        'remarks' => 'Checked at night.',
        'status' => 'Non-Compliant',
        'recorded_by' => 'Admin User',
    ]);
    Compliance::factory()->create([
        'room_id' => $otherRoom->id,
        'issues' => 'Computers left on',
        'status' => 'Resolved',
        'recorded_by' => 'Admin User',
    ]);

    $this->withHeaders(apiAs($admin))
        ->getJson('/api/admin/compliances?search=MB-212')
        ->assertOk()
        ->assertJsonPath('meta.total', 1)
        ->assertJsonPath('data.0.room.room_name', 'MB-212');

    $this->withHeaders(apiAs($admin))
        ->getJson('/api/admin/compliances?search=Lights')
        ->assertOk()
        ->assertJsonPath('meta.total', 1)
        ->assertJsonPath('data.0.issues', 'Lights left on');

    $this->withHeaders(apiAs($admin))
        ->getJson('/api/admin/compliances?status=Resolved')
        ->assertOk()
        ->assertJsonPath('meta.total', 1)
        ->assertJsonPath('data.0.room.room_name', 'AS-101');
});

it('paginates compliances', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $room = Room::factory()->create();
    Compliance::factory()->count(25)->create(['room_id' => $room->id]);

    $response = $this->withHeaders(apiAs($admin))
        ->getJson('/api/admin/compliances?per_page=10&page=2');

    $response->assertOk()
        ->assertJsonPath('meta.current_page', 2)
        ->assertJsonPath('meta.last_page', 3);

    expect(count($response->json('data')))->toBe(10);
});

it('sorts compliances by id descending by default and ascending on request', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $room = Room::factory()->create();
    $first = Compliance::factory()->create(['room_id' => $room->id]);
    $second = Compliance::factory()->create(['room_id' => $room->id]);
    $third = Compliance::factory()->create(['room_id' => $room->id]);

    $this->withHeaders(apiAs($admin))->getJson('/api/admin/compliances')
        ->assertOk()
        ->assertJsonPath('data.0.id', $third->id)
        ->assertJsonPath('data.1.id', $second->id)
        ->assertJsonPath('data.2.id', $first->id);

    $this->withHeaders(apiAs($admin))->getJson('/api/admin/compliances?sort_dir=asc')
        ->assertOk()
        ->assertJsonPath('data.0.id', $first->id)
        ->assertJsonPath('data.2.id', $third->id);
});

it('creates a compliance with photo evidences and records the auth user', function () {
    $admin = User::factory()->create(['role' => 'admin', 'name' => 'Jane Admin']);
    $room = Room::factory()->create();

    $response = $this->withHeaders(apiAs($admin))->postJson('/api/admin/compliances', [
        'room_id' => $room->id,
        'issues' => 'Lights left on, Windows not locked',
        'remarks' => 'Reported after patrol.',
        'photo_evidences' => [
            UploadedFile::fake()->image('evidence1.jpg'),
            UploadedFile::fake()->image('evidence2.jpg'),
        ],
    ]);

    $response->assertStatus(201)
        ->assertJsonPath('data.room.room_name', $room->room_name)
        ->assertJsonPath('data.issues', 'Lights left on, Windows not locked')
        ->assertJsonPath('data.remarks', 'Reported after patrol.')
        ->assertJsonPath('data.status', 'Non-Compliant')
        ->assertJsonPath('data.recorded_by', 'Jane Admin');

    expect(count($response->json('data.photo_evidences')))->toBe(2);

    $this->assertDatabaseHas('compliances', [
        'room_id' => $room->id,
        'recorded_by' => 'Jane Admin',
        'status' => 'Non-Compliant',
    ]);

    expect(Compliance::first()->photoEvidences()->count())->toBe(2);
});

it('requires at least one issue when creating', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $room = Room::factory()->create();

    $this->withHeaders(apiAs($admin))->postJson('/api/admin/compliances', [
        'room_id' => $room->id,
        'remarks' => 'Room is clean.',
        'photo_evidences' => [
            UploadedFile::fake()->image('clean-room.jpg'),
        ],
    ])->assertStatus(422)
        ->assertJsonValidationErrors(['issues']);
});

it('requires at least one photo evidence when creating', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $room = Room::factory()->create();

    $this->withHeaders(apiAs($admin))->postJson('/api/admin/compliances', [
        'room_id' => $room->id,
        'issues' => 'Aircon left on',
        'remarks' => null,
    ])->assertStatus(422)
        ->assertJsonValidationErrors(['photo_evidences']);
});

it('validates compliance creation payload', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $this->withHeaders(apiAs($admin))->postJson('/api/admin/compliances', [
        'room_id' => 9999,
        'issues' => '',
        'status' => 'Maybe',
        'photo_evidences' => [
            UploadedFile::fake()->create('document.pdf', 100, 'application/pdf'),
        ],
    ])->assertStatus(422)
        ->assertJsonValidationErrors(['room_id', 'issues', 'photo_evidences.0']);
});

it('updates a compliance and can add or remove photo evidences', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $room = Room::factory()->create();
    $compliance = Compliance::factory()->create(['room_id' => $room->id, 'status' => 'Resolved']);
    $photo = $compliance->photoEvidences()->create(['photo_path' => 'compliances/old.jpg']);

    $response = $this->withHeaders(apiAs($admin))->postJson("/api/admin/compliances/{$compliance->id}", [
        'room_id' => $room->id,
        'issues' => 'Equipment improperly used',
        'remarks' => 'Updated remarks.',
        'photo_evidences' => [
            UploadedFile::fake()->image('new-evidence.jpg'),
        ],
        'remove_photo_ids' => [$photo->id],
    ]);

    $response->assertOk()
        ->assertJsonPath('data.issues', 'Equipment improperly used')
        ->assertJsonPath('data.status', 'Non-Compliant');

    expect(count($response->json('data.photo_evidences')))->toBe(1);

    $compliance->refresh();
    $this->assertSame('Non-Compliant', $compliance->status);
    expect($compliance->photoEvidences()->count())->toBe(1);
    $this->assertDatabaseMissing('photo_evidences', ['id' => $photo->id]);
});

it('allows updating without photo evidences', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $room = Room::factory()->create();
    $compliance = Compliance::factory()->create(['room_id' => $room->id]);

    $this->withHeaders(apiAs($admin))->postJson("/api/admin/compliances/{$compliance->id}", [
        'room_id' => $room->id,
        'issues' => 'Windows not locked',
        'remarks' => 'No new photos.',
    ])->assertOk()
        ->assertJsonPath('data.issues', 'Windows not locked');
});

it('lets an admin change only the status of a compliance', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $room = Room::factory()->create();
    $compliance = Compliance::factory()->create([
        'room_id' => $room->id,
        'issues' => 'Aircon left on',
        'status' => 'Non-Compliant',
    ]);

    $response = $this->withHeaders(apiAs($admin))->postJson("/api/admin/compliances/{$compliance->id}", [
        'room_id' => $room->id,
        'status' => 'Resolved',
    ]);

    $response->assertOk()
        ->assertJsonPath('data.status', 'Resolved')
        ->assertJsonPath('data.issues', 'Aircon left on');

    $this->assertDatabaseHas('compliances', [
        'id' => $compliance->id,
        'status' => 'Resolved',
        'issues' => 'Aircon left on',
    ]);
});

it('rejects an invalid status value', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $room = Room::factory()->create();
    $compliance = Compliance::factory()->create(['room_id' => $room->id]);

    $this->withHeaders(apiAs($admin))->postJson("/api/admin/compliances/{$compliance->id}", [
        'room_id' => $room->id,
        'status' => 'Maybe',
    ])->assertStatus(422)
        ->assertJsonValidationErrors(['status']);
});

it('blocks deleting a compliance that has photo evidences', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $room = Room::factory()->create();
    $compliance = Compliance::factory()->create(['room_id' => $room->id]);
    $compliance->photoEvidences()->create(['photo_path' => 'compliances/evidence.jpg']);

    $this->withHeaders(apiAs($admin))->deleteJson("/api/admin/compliances/{$compliance->id}")
        ->assertStatus(422)
        ->assertJsonValidationErrors(['status']);

    $this->assertDatabaseHas('compliances', ['id' => $compliance->id]);
    $this->assertDatabaseHas('photo_evidences', ['compliance_id' => $compliance->id]);
});

it('deletes a compliance without photo evidences', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $room = Room::factory()->create();
    $compliance = Compliance::factory()->create(['room_id' => $room->id]);

    $this->withHeaders(apiAs($admin))->deleteJson("/api/admin/compliances/{$compliance->id}")
        ->assertOk()
        ->assertJsonPath('message', 'Compliance record deleted.');

    $this->assertDatabaseMissing('compliances', ['id' => $compliance->id]);
});

it('shows a single compliance with its photo evidences', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $room = Room::factory()->create(['room_name' => 'MB-212']);
    $compliance = Compliance::factory()->create([
        'room_id' => $room->id,
        'issues' => 'Lights left on',
        'recorded_by' => 'Admin User',
    ]);
    $compliance->photoEvidences()->create(['photo_path' => 'compliances/evidence.jpg']);

    $response = $this->withHeaders(apiAs($admin))
        ->getJson("/api/admin/compliances/{$compliance->id}")
        ->assertOk()
        ->assertJsonPath('data.id', $compliance->id)
        ->assertJsonPath('data.room.room_name', 'MB-212')
        ->assertJsonPath('data.recorded_by', 'Admin User');

    expect(count($response->json('data.photo_evidences')))->toBe(1);
});

it('forbids non-admin users from managing compliances', function () {
    $guard = User::factory()->create(['role' => 'guard']);

    $this->withHeaders(apiAs($guard))->getJson('/api/admin/compliances')->assertStatus(403);
    $this->withHeaders(apiAs($guard))->postJson('/api/admin/compliances', ['issues' => 'Test'])->assertStatus(403);
});

it('includes the admin name as noted_by on the compliance slip', function () {
    $admin = User::factory()->create(['role' => 'admin', 'name' => 'Jane Admin']);
    $room = Room::factory()->create();
    $compliance = Compliance::factory()->create(['room_id' => $room->id, 'recorded_by' => 'Guard One']);

    $this->withHeaders(apiAs($admin))
        ->getJson("/api/admin/compliances/{$compliance->id}")
        ->assertOk()
        ->assertJsonPath('data.noted_by', 'Jane Admin');
});
