<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\UpdateProfileRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
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
