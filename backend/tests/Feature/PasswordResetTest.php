<?php

use App\Models\User;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;

uses(RefreshDatabase::class);

it('sends a password reset link to an existing email', function () {
    Notification::fake();

    $user = User::factory()->create(['email' => 'guard@example.com']);

    $this->postJson('/api/forgot-password', ['email' => 'guard@example.com'])
        ->assertOk()
        ->assertJson([
            'message' => 'If that email address exists in our records, a password reset link has been sent to it.',
        ]);

    Notification::assertSentTo($user, ResetPasswordNotification::class);
    Notification::assertSentTo(
        $user,
        ResetPasswordNotification::class,
        fn (ResetPasswordNotification $notification) => $notification instanceof ShouldQueue
    );
});

it('does not reveal whether an email exists', function () {
    Notification::fake();

    $this->postJson('/api/forgot-password', ['email' => 'ghost@example.com'])
        ->assertOk()
        ->assertJson([
            'message' => 'If that email address exists in our records, a password reset link has been sent to it.',
        ]);

    Notification::assertNothingSent();
});

it('requires a valid email for forgot password', function () {
    $this->postJson('/api/forgot-password', ['email' => 'not-an-email'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('email');
});

it('throttles repeated password reset requests for the same email', function () {
    Notification::fake();

    $user = User::factory()->create();

    $this->postJson('/api/forgot-password', ['email' => $user->email])->assertOk();
    $this->postJson('/api/forgot-password', ['email' => $user->email])->assertStatus(429);
});

it('resets the password with a valid token', function () {
    $user = User::factory()->create(['password' => Hash::make('old-password')]);
    $token = Password::broker()->createToken($user);

    $this->postJson('/api/reset-password', [
        'email' => $user->email,
        'token' => $token,
        'password' => 'new-password-123',
        'password_confirmation' => 'new-password-123',
    ])->assertOk()
        ->assertJson([
            'message' => 'Your password has been reset successfully. You can now sign in.',
        ]);

    expect(Hash::check('new-password-123', $user->fresh()->password))->toBeTrue();

    $this->postJson('/api/login', [
        'email' => $user->email,
        'password' => 'new-password-123',
    ])->assertOk();
});

it('rejects an invalid or expired reset token', function () {
    $user = User::factory()->create();

    $this->postJson('/api/reset-password', [
        'email' => $user->email,
        'token' => 'invalid-token',
        'password' => 'new-password-123',
        'password_confirmation' => 'new-password-123',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors('token');

    expect(Hash::check('new-password-123', $user->fresh()->password))->toBeFalse();
});

it('validates password confirmation and minimum length on reset', function () {
    $user = User::factory()->create();
    $token = Password::broker()->createToken($user);

    $this->postJson('/api/reset-password', [
        'email' => $user->email,
        'token' => $token,
        'password' => 'short',
        'password_confirmation' => 'different',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors(['password']);
});
