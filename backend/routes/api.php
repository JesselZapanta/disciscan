<?php

use App\Http\Controllers\Api\Admin\RoomController;
use App\Http\Controllers\Api\Admin\UserController;
use App\Http\Controllers\Api\Admin\ViolationTypeController;
use App\Http\Controllers\Api\Admin\VisitorRegistrationController as AdminVisitorRegistrationController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Guard\VisitorRegistrationController as GuardVisitorRegistrationController;
use App\Http\Controllers\Api\Guard\VisitorScanController;
use App\Http\Controllers\Api\VisitorRegistrationController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

// Route::post('/visitor-registrations', [VisitorRegistrationController::class, 'store'])->middleware('throttle:visitor-registrations');

Route::post('/visitor-registrations', [VisitorRegistrationController::class, 'store']);

Route::middleware('auth:api')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::match(['put', 'post'], '/profile', [AuthController::class, 'updateProfile']);

    Route::prefix('admin')->middleware('admin')->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::match(['put', 'post'], '/users/{user}', [UserController::class, 'update']);
        Route::delete('/users/{user}', [UserController::class, 'destroy']);

        Route::get('/violation-types', [ViolationTypeController::class, 'index']);
        Route::post('/violation-types', [ViolationTypeController::class, 'store']);
        Route::match(['put', 'post'], '/violation-types/{violationType}', [ViolationTypeController::class, 'update']);
        Route::delete('/violation-types/{violationType}', [ViolationTypeController::class, 'destroy']);

        Route::get('/rooms', [RoomController::class, 'index']);
        Route::post('/rooms', [RoomController::class, 'store']);
        Route::match(['put', 'post'], '/rooms/{room}', [RoomController::class, 'update']);
        Route::delete('/rooms/{room}', [RoomController::class, 'destroy']);

        Route::get('/visitor-registrations', [AdminVisitorRegistrationController::class, 'index']);
    });

    Route::prefix('guard')->middleware('guard')->group(function () {
        Route::get('/visitors', [GuardVisitorRegistrationController::class, 'index']);
        Route::get('/visitors/lookup/{recordNo}', [VisitorScanController::class, 'lookup']);
        Route::match(['put', 'post'], '/visitors/{visitor}', [VisitorScanController::class, 'update']);
        Route::post('/visitors/{visitor}/check-in', [VisitorScanController::class, 'checkIn']);
        Route::post('/visitors/{visitor}/check-out', [VisitorScanController::class, 'checkOut']);
    });
});
