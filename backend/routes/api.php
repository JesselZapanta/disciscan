<?php

use App\Http\Controllers\Api\Admin\AcademicYearController;
use App\Http\Controllers\Api\Admin\ComplianceController;
use App\Http\Controllers\Api\Admin\IssueController;
use App\Http\Controllers\Api\Admin\RoomController;
use App\Http\Controllers\Api\Admin\StudentController;
use App\Http\Controllers\Api\Admin\UserController;
use App\Http\Controllers\Api\Admin\ViolationTypeController;
use App\Http\Controllers\Api\Admin\VisitorRegistrationController as AdminVisitorRegistrationController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Guard\ComplianceController as GuardComplianceController;
use App\Http\Controllers\Api\Guard\StudentScanController;
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

        Route::get('/issues', [IssueController::class, 'index']);
        Route::post('/issues', [IssueController::class, 'store']);
        Route::match(['put', 'post'], '/issues/{issue}', [IssueController::class, 'update']);
        Route::delete('/issues/{issue}', [IssueController::class, 'destroy']);

        Route::get('/academic-years', [AcademicYearController::class, 'index']);
        Route::post('/academic-years', [AcademicYearController::class, 'store']);
        Route::match(['put', 'post'], '/academic-years/{academicYear}', [AcademicYearController::class, 'update']);
        Route::delete('/academic-years/{academicYear}', [AcademicYearController::class, 'destroy']);

        Route::get('/students', [StudentController::class, 'index']);
        Route::post('/students', [StudentController::class, 'store']);
        Route::get('/students/import-template', [StudentController::class, 'importTemplate']);
        Route::post('/students/import', [StudentController::class, 'import']);
        Route::match(['put', 'post'], '/students/{student}', [StudentController::class, 'update']);
        Route::delete('/students/{student}', [StudentController::class, 'destroy']);

        Route::get('/compliances', [ComplianceController::class, 'index']);
        Route::get('/compliances/{compliance}', [ComplianceController::class, 'show']);
        Route::post('/compliances', [ComplianceController::class, 'store']);
        Route::match(['put', 'post'], '/compliances/{compliance}', [ComplianceController::class, 'update']);
        Route::delete('/compliances/{compliance}', [ComplianceController::class, 'destroy']);

        Route::get('/visitor-registrations', [AdminVisitorRegistrationController::class, 'index']);
    });

    Route::prefix('guard')->middleware('guard')->group(function () {
        Route::get('/visitors', [GuardVisitorRegistrationController::class, 'index']);
        Route::get('/visitors/lookup/{recordNo}', [VisitorScanController::class, 'lookup']);
        Route::match(['put', 'post'], '/visitors/{visitor}', [VisitorScanController::class, 'update']);
        Route::post('/visitors/{visitor}/check-in', [VisitorScanController::class, 'checkIn']);
        Route::post('/visitors/{visitor}/check-out', [VisitorScanController::class, 'checkOut']);

        Route::get('/students/lookup/{idNumber}', [StudentScanController::class, 'lookup']);
        Route::post('/students/{student}/check-in', [StudentScanController::class, 'checkIn']);
        Route::post('/students/{student}/check-out', [StudentScanController::class, 'checkOut']);

        Route::get('/rooms', [RoomController::class, 'index']);
        Route::get('/issues', [IssueController::class, 'index']);

        Route::get('/compliances', [GuardComplianceController::class, 'index']);
        Route::get('/compliances/{compliance}', [GuardComplianceController::class, 'show']);
        Route::post('/compliances', [GuardComplianceController::class, 'store']);
        Route::match(['put', 'post'], '/compliances/{compliance}', [GuardComplianceController::class, 'update']);
        Route::delete('/compliances/{compliance}', [GuardComplianceController::class, 'destroy']);
    });
});
