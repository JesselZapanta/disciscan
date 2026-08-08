<?php

use App\Models\Compliance;
use App\Models\Issue;
use App\Models\Room;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;

uses(RefreshDatabase::class);

it('lists compliances for guards with search and status filter', function () {
    $guard = User::factory()->create(['role' => 'guard', 'name' => 'Guard One']);

    $room = Room::factory()->create(['room_name' => 'MB-212']);
    $otherRoom = Room::factory()->create(['room_name' => 'AS-101']);

    Compliance::factory()->create([
        'room_id' => $room->id,
        'issues' => 'Lights left on',
        'status' => 'Non-Compliant',
        'recorded_by' => 'Guard One',
    ]);
    Compliance::factory()->create([
        'room_id' => $otherRoom->id,
        'issues' => 'Computers left on',
        'status' => 'Resolved',
        'recorded_by' => 'Guard One',
    ]);

    $this->withHeaders(apiAs($guard))
        ->getJson('/api/guard/compliances?search=MB-212')
        ->assertOk()
        ->assertJsonPath('meta.total', 1)
        ->assertJsonPath('data.0.room.room_name', 'MB-212');

    $this->withHeaders(apiAs($guard))
        ->getJson('/api/guard/compliances?status=Resolved')
        ->assertOk()
        ->assertJsonPath('meta.total', 1)
        ->assertJsonPath('data.0.room.room_name', 'AS-101');
});

it('lets a guard create a compliance with photo evidences', function () {
    $guard = User::factory()->create(['role' => 'guard', 'name' => 'Marc Guard']);
    $room = Room::factory()->create();

    $response = $this->withHeaders(apiAs($guard))->postJson('/api/guard/compliances', [
        'room_id' => $room->id,
        'issues' => 'Aircon left on',
        'remarks' => 'Spotted during patrol.',
        'photo_evidences' => [
            UploadedFile::fake()->image('evidence.jpg'),
        ],
    ]);

    $response->assertStatus(201)
        ->assertJsonPath('data.room.room_name', $room->room_name)
        ->assertJsonPath('data.status', 'Non-Compliant')
        ->assertJsonPath('data.recorded_by', 'Marc Guard');

    $this->assertDatabaseHas('compliances', [
        'room_id' => $room->id,
        'recorded_by' => 'Marc Guard',
        'status' => 'Non-Compliant',
    ]);

    expect(Compliance::first()->photoEvidences()->count())->toBe(1);
});

it('requires at least one issue when a guard creates a record', function () {
    $guard = User::factory()->create(['role' => 'guard']);
    $room = Room::factory()->create();

    $this->withHeaders(apiAs($guard))->postJson('/api/guard/compliances', [
        'room_id' => $room->id,
        'photo_evidences' => [
            UploadedFile::fake()->image('clean-room.jpg'),
        ],
    ])->assertStatus(422)
        ->assertJsonValidationErrors(['issues']);
});

it('lets a guard update and delete a compliance', function () {
    $guard = User::factory()->create(['role' => 'guard', 'name' => 'Nica Guard']);
    $room = Room::factory()->create();
    $compliance = Compliance::factory()->create(['room_id' => $room->id]);
    $photo = $compliance->photoEvidences()->create(['photo_path' => 'compliances/old.jpg']);

    $response = $this->withHeaders(apiAs($guard))->postJson("/api/guard/compliances/{$compliance->id}", [
        'room_id' => $room->id,
        'issues' => 'Windows not locked',
        'remarks' => 'Updated by guard.',
        'photo_evidences' => [
            UploadedFile::fake()->image('new-evidence.jpg'),
        ],
        'remove_photo_ids' => [$photo->id],
    ]);

    $response->assertOk()
        ->assertJsonPath('data.issues', 'Windows not locked')
        ->assertJsonPath('data.status', 'Non-Compliant');

    expect(count($response->json('data.photo_evidences')))->toBe(1);
    $this->assertDatabaseMissing('photo_evidences', ['id' => $photo->id]);

    $this->withHeaders(apiAs($guard))
        ->deleteJson("/api/guard/compliances/{$compliance->id}")
        ->assertOk();

    $this->assertDatabaseMissing('compliances', ['id' => $compliance->id]);
});

it('shows a single compliance for guards', function () {
    $guard = User::factory()->create(['role' => 'guard']);
    $room = Room::factory()->create(['room_name' => 'AS-101']);
    $compliance = Compliance::factory()->create([
        'room_id' => $room->id,
        'issues' => 'Aircon left on',
        'recorded_by' => 'Guard One',
    ]);

    $this->withHeaders(apiAs($guard))
        ->getJson("/api/guard/compliances/{$compliance->id}")
        ->assertOk()
        ->assertJsonPath('data.id', $compliance->id)
        ->assertJsonPath('data.room.room_name', 'AS-101')
        ->assertJsonPath('data.recorded_by', 'Guard One');
});

it('forbids admins from using guard compliance endpoints', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $this->withHeaders(apiAs($admin))
        ->getJson('/api/guard/compliances')
        ->assertForbidden();

    $room = Room::factory()->create();

    $this->withHeaders(apiAs($admin))
        ->postJson('/api/guard/compliances', [
            'room_id' => $room->id,
            'photo_evidences' => [UploadedFile::fake()->image('evidence.jpg')],
        ])
        ->assertForbidden();
});

it('lets guards list rooms and issues for the compliance form', function () {
    $guard = User::factory()->create(['role' => 'guard']);
    $room = Room::factory()->create();
    $issue = Issue::factory()->create();

    $this->withHeaders(apiAs($guard))
        ->getJson('/api/guard/rooms?per_page=100')
        ->assertOk()
        ->assertJsonPath('meta.total', 1)
        ->assertJsonPath('data.0.id', $room->id);

    $this->withHeaders(apiAs($guard))
        ->getJson('/api/guard/issues?per_page=100')
        ->assertOk()
        ->assertJsonPath('meta.total', 1)
        ->assertJsonPath('data.0.id', $issue->id);
});

it('includes the admin name as noted_by on the guard compliance slip', function () {
    $admin = User::factory()->create(['role' => 'admin', 'name' => 'Jane Admin']);
    $guard = User::factory()->create(['role' => 'guard']);
    $room = Room::factory()->create();
    $compliance = Compliance::factory()->create(['room_id' => $room->id, 'recorded_by' => $guard->name]);

    $this->withHeaders(apiAs($guard))
        ->getJson("/api/guard/compliances/{$compliance->id}")
        ->assertOk()
        ->assertJsonPath('data.noted_by', 'Jane Admin');
});
