<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ForgotPasswordRequest;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\ResetPasswordRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Storage;
use Tymon\JWTAuth\JWTGuard;

class AuthController extends Controller
{
    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->only('email', 'password');

        /** @var JWTGuard $guard */
        $guard = auth('api');

        if (! $token = $guard->attempt($credentials)) {
            return response()->json(['message' => 'Invalid credentials.'], 401);
        }

        return response()->json([
            'token' => $token,
            'user' => $guard->user(),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        /** @var JWTGuard $guard */
        $guard = auth('api');

        $guard->invalidate(true);

        return response()->json(['message' => 'Successfully logged out.']);
    }

    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $status = Password::broker()->sendResetLink($request->only('email'));

        if ($status === Password::RESET_THROTTLED) {
            return response()->json([
                'message' => 'Too many password reset requests. Please try again later.',
                'errors' => [
                    'email' => ['Too many password reset requests. Please wait before trying again.'],
                ],
            ], 429);
        }

        return response()->json([
            'message' => 'If that email address exists in our records, a password reset link has been sent to it.',
        ]);
    }

    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $status = Password::broker()->reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password): void {
                $user->password = Hash::make($password);
                $user->save();
            }
        );

        return match ($status) {
            Password::PASSWORD_RESET => response()->json([
                'message' => 'Your password has been reset successfully. You can now sign in.',
            ]),
            Password::INVALID_TOKEN => response()->json([
                'message' => 'This password reset link is invalid or has expired.',
                'errors' => [
                    'token' => ['This password reset link is invalid or has expired.'],
                ],
            ], 422),
            default => response()->json([
                'message' => 'We could not find an account with that email address.',
                'errors' => [
                    'email' => ['We could not find an account with that email address.'],
                ],
            ], 422),
        };
    }

    public function me(Request $request): JsonResponse
    {
        /** @var JWTGuard $guard */
        $guard = auth('api');

        return response()->json($guard->user());
    }

    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        /** @var JWTGuard $guard */
        $guard = auth('api');

        $user = $guard->user();
        $user->name = $request->input('name');

        if ($request->boolean('remove_profile')) {
            if ($user->profile) {
                Storage::disk('public')->delete($user->profile);
            }

            $user->profile = null;
        } elseif ($request->hasFile('profile')) {
            if ($user->profile) {
                Storage::disk('public')->delete($user->profile);
            }

            $user->profile = $request->file('profile')->store('profiles', 'public');
        }

        if ($request->filled('password')) {
            if (! Hash::check($request->input('current_password'), $user->password)) {
                return response()->json([
                    'message' => 'The current password is incorrect.',
                    'errors' => [
                        'current_password' => ['The current password is incorrect.'],
                    ],
                ], 422);
            }

            $user->password = Hash::make($request->input('password'));
        }

        $user->save();

        return response()->json($user);
    }
}
