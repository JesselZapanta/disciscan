<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

it('lists users with search, role filter and pagination', function () {
    $admin = User::factory()->create(['role' => 'admin', 'name' => 'Kenley Bronola']);

    $ken = User::factory()->create(['role' => 'admin', 'name' => 'Ken Adams']);
    $kim = User::factory()->create(['role' => 'guard', 'name' => 'Kimberly Magsayo']);
    User::factory()->create(['role' => 'guard', 'name' => 'Romel Ondona']);

    $response = $this->withHeaders(apiAs($admin))
        ->getJson('/api/admin/users?search=ken&role=admin&per_page=10');

    $response->assertOk()
        ->assertJsonPath('meta.total', 1)
        ->assertJsonPath('data.0.id', $ken->id)
        ->assertJsonPath('data.0.name', 'Ken Adams')
        ->assertJsonMissing(['id' => $admin->id])
        ->assertJsonMissing(['id' => $kim->id]);
});

it('paginates users', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    User::factory()->count(25)->create(['role' => 'guard']);

    $response = $this->withHeaders(apiAs($admin))
        ->getJson('/api/admin/users?per_page=10&page=2');

    $response->assertOk()
        ->assertJsonPath('meta.current_page', 2)
        ->assertJsonPath('meta.per_page', 10)
        ->assertJsonPath('meta.last_page', 3);

    expect(count($response->json('data')))->toBe(10);
});

it('sorts by id descending by default and ascending on request', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $first = User::factory()->create(['role' => 'guard']);
    $second = User::factory()->create(['role' => 'guard']);
    $third = User::factory()->create(['role' => 'guard']);

    $this->withHeaders(apiAs($admin))->getJson('/api/admin/users')
        ->assertOk()
        ->assertJsonPath('data.0.id', $third->id)
        ->assertJsonPath('data.1.id', $second->id)
        ->assertJsonPath('data.2.id', $first->id);

    $this->withHeaders(apiAs($admin))->getJson('/api/admin/users?sort_dir=asc')
        ->assertOk()
        ->assertJsonPath('data.0.id', $first->id)
        ->assertJsonPath('data.2.id', $third->id);

    $this->withHeaders(apiAs($admin))->getJson('/api/admin/users?sort_dir=bogus')
        ->assertOk()
        ->assertJsonPath('data.0.id', $third->id);
});

it('does not return the password or remember token for users', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    User::factory()->create(['role' => 'guard', 'name' => 'Guard One']);

    $response = $this->withHeaders(apiAs($admin))->getJson('/api/admin/users');

    $response->assertOk()
        ->assertJsonMissingPath('data.0.password')
        ->assertJsonMissingPath('data.0.remember_token');
});

it('requires authentication', function () {
    $this->getJson('/api/admin/users')->assertStatus(401);
});

it('forbids non-admin users', function () {
    $guard = User::factory()->create(['role' => 'guard']);

    $this->withHeaders(apiAs($guard))->getJson('/api/admin/users')->assertStatus(403);
});

it('creates a user', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $response = $this->withHeaders(apiAs($admin))->postJson('/api/admin/users', [
        'name' => 'New Guard',
        'email' => 'new.guard@example.com',
        'role' => 'guard',
        'password' => 'secret123',
        'password_confirmation' => 'secret123',
    ]);

    $response->assertStatus(201)
        ->assertJsonPath('data.name', 'New Guard')
        ->assertJsonPath('data.email', 'new.guard@example.com')
        ->assertJsonPath('data.role', 'guard');

    $this->assertDatabaseHas('users', ['email' => 'new.guard@example.com']);
    $this->assertTrue(password_verify('secret123', User::where('email', 'new.guard@example.com')->first()->password));
});

it('creates a user with a profile photo', function () {
    Storage::fake('public');
    $admin = User::factory()->create(['role' => 'admin']);

    $response = $this->withHeaders(apiAs($admin))->postJson('/api/admin/users', [
        'name' => 'Photo Guard',
        'email' => 'photo.guard@example.com',
        'role' => 'guard',
        'password' => 'secret123',
        'password_confirmation' => 'secret123',
        'profile' => UploadedFile::fake()->image('photo.jpg'),
    ]);

    $response->assertStatus(201)
        ->assertJsonPath('data.name', 'Photo Guard')
        ->assertJsonPath('data.profile', fn ($profile) => str_starts_with($profile, 'profiles/'));

    Storage::disk('public')->assertExists(User::where('email', 'photo.guard@example.com')->first()->profile);
});

it('rejects invalid profile uploads', function () {
    Storage::fake('public');
    $admin = User::factory()->create(['role' => 'admin']);

    $this->withHeaders(apiAs($admin))->postJson('/api/admin/users', [
        'name' => 'Bad Photo',
        'email' => 'bad.photo@example.com',
        'role' => 'guard',
        'password' => 'secret123',
        'password_confirmation' => 'secret123',
        'profile' => UploadedFile::fake()->create('notes.txt', 10),
    ])->assertStatus(422)
        ->assertJsonValidationErrors(['profile']);
});

it('replaces and removes the profile photo on update', function () {
    Storage::fake('public');
    $admin = User::factory()->create(['role' => 'admin']);
    $target = User::factory()->create([
        'role' => 'guard',
        'profile' => 'profiles/old-photo.jpg',
    ]);

    Storage::disk('public')->put('profiles/old-photo.jpg', 'old');

    $response = $this->withHeaders(apiAs($admin))->postJson("/api/admin/users/{$target->id}", [
        'name' => $target->name,
        'email' => $target->email,
        'role' => 'guard',
        'profile' => UploadedFile::fake()->image('new-photo.jpg'),
    ]);

    $response->assertOk();

    $target->refresh();
    $this->assertNotSame('profiles/old-photo.jpg', $target->profile);
    Storage::disk('public')->assertExists($target->profile);
    Storage::disk('public')->assertMissing('profiles/old-photo.jpg');

    $currentProfile = $target->profile;

    $this->withHeaders(apiAs($admin))->postJson("/api/admin/users/{$target->id}", [
        'name' => $target->name,
        'email' => $target->email,
        'role' => 'guard',
        'remove_profile' => '1',
    ])->assertOk();

    $target->refresh();
    $this->assertNull($target->profile);
    Storage::disk('public')->assertMissing($currentProfile);
});

it('validates creation payload', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $this->withHeaders(apiAs($admin))->postJson('/api/admin/users', [
        'name' => '',
        'email' => 'not-an-email',
        'role' => 'superadmin',
        'password' => 'short',
    ])->assertStatus(422)
        ->assertJsonValidationErrors(['name', 'email', 'role', 'password']);
});

it('updates a user', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $target = User::factory()->create(['role' => 'guard', 'name' => 'Old Name']);

    $response = $this->withHeaders(apiAs($admin))->putJson("/api/admin/users/{$target->id}", [
        'name' => 'New Name',
        'email' => 'updated@example.com',
        'role' => 'admin',
        'password' => '',
    ]);

    $response->assertOk()
        ->assertJsonPath('data.name', 'New Name')
        ->assertJsonPath('data.email', 'updated@example.com')
        ->assertJsonPath('data.role', 'admin');

    $target->refresh();
    $this->assertSame('New Name', $target->name);
    $this->assertTrue(password_verify('password', $target->password), 'password must be unchanged when blank');
});

it('rejects updating the own account', function () {
    $admin = User::factory()->create(['role' => 'admin', 'name' => 'Boss']);

    $this->withHeaders(apiAs($admin))->putJson("/api/admin/users/{$admin->id}", [
        'name' => 'Hacker',
        'email' => $admin->email,
        'role' => 'admin',
    ])->assertStatus(403);
});

it('deletes a user', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $target = User::factory()->create(['role' => 'guard']);

    $this->withHeaders(apiAs($admin))->deleteJson("/api/admin/users/{$target->id}")
        ->assertOk()
        ->assertJsonPath('message', 'User deleted.');

    $this->assertDatabaseMissing('users', ['id' => $target->id]);
});

it('rejects deleting the own account', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $this->withHeaders(apiAs($admin))->deleteJson("/api/admin/users/{$admin->id}")
        ->assertStatus(403);

    $this->assertDatabaseHas('users', ['id' => $admin->id]);
});
