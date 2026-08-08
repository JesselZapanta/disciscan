<?php

use App\Models\AcademicYear;
use App\Models\Student;
use App\Models\User;
use Database\Seeders\AcademicYearSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('lists academic years with search, status filter and pagination', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    AcademicYear::factory()->create(['code' => 'AY 2025-2026', 'description' => 'School Year 2025-2026', 'status' => 'active']);
    AcademicYear::factory()->create(['code' => 'AY 2024-2025', 'description' => 'School Year 2024-2025', 'status' => 'active']);
    AcademicYear::factory()->create(['code' => 'AY 2023-2024', 'description' => 'School Year 2023-2024', 'status' => 'inactive']);

    $this->withHeaders(apiAs($admin))
        ->getJson('/api/admin/academic-years?search=2026')
        ->assertOk()
        ->assertJsonPath('meta.total', 1)
        ->assertJsonPath('data.0.code', 'AY 2025-2026')
        ->assertJsonPath('data.0.status', 'active');

    $this->withHeaders(apiAs($admin))
        ->getJson('/api/admin/academic-years?status=inactive')
        ->assertOk()
        ->assertJsonPath('meta.total', 1)
        ->assertJsonPath('data.0.code', 'AY 2023-2024');
});

it('paginates academic years', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    AcademicYear::factory()->count(25)->create();

    $response = $this->withHeaders(apiAs($admin))
        ->getJson('/api/admin/academic-years?per_page=10&page=2');

    $response->assertOk()
        ->assertJsonPath('meta.current_page', 2)
        ->assertJsonPath('meta.last_page', 3);

    expect(count($response->json('data')))->toBe(10);
});

it('sorts academic years by id descending by default and ascending on request', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $first = AcademicYear::factory()->create();
    $second = AcademicYear::factory()->create();
    $third = AcademicYear::factory()->create();

    $this->withHeaders(apiAs($admin))->getJson('/api/admin/academic-years')
        ->assertOk()
        ->assertJsonPath('data.0.id', $third->id)
        ->assertJsonPath('data.1.id', $second->id)
        ->assertJsonPath('data.2.id', $first->id);

    $this->withHeaders(apiAs($admin))->getJson('/api/admin/academic-years?sort_dir=asc')
        ->assertOk()
        ->assertJsonPath('data.0.id', $first->id)
        ->assertJsonPath('data.2.id', $third->id);
});

it('creates an academic year inactive by default', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $response = $this->withHeaders(apiAs($admin))->postJson('/api/admin/academic-years', [
        'code' => 'AY 2026-2027',
        'description' => 'School Year 2026-2027',
    ]);

    $response->assertStatus(201)
        ->assertJsonPath('data.code', 'AY 2026-2027')
        ->assertJsonPath('data.description', 'School Year 2026-2027')
        ->assertJsonPath('data.status', 'inactive');

    $this->assertDatabaseHas('academic_years', [
        'code' => 'AY 2026-2027',
        'status' => 'inactive',
    ]);
});

it('creates an academic year with a requested status', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $this->withHeaders(apiAs($admin))->postJson('/api/admin/academic-years', [
        'code' => 'AY 2025-2026',
        'description' => 'School Year 2025-2026',
        'status' => 'active',
    ])->assertStatus(201)
        ->assertJsonPath('data.status', 'active');
});

it('validates academic year creation payload', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $this->withHeaders(apiAs($admin))->postJson('/api/admin/academic-years', [
        'code' => '',
        'description' => '',
        'status' => 'Maybe',
    ])->assertStatus(422)
        ->assertJsonValidationErrors(['code', 'description', 'status']);
});

it('rejects duplicate academic year codes', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    AcademicYear::factory()->create(['code' => 'AY 2025-2026']);

    $this->withHeaders(apiAs($admin))->postJson('/api/admin/academic-years', [
        'code' => 'AY 2025-2026',
        'description' => 'Duplicate.',
    ])->assertStatus(422)
        ->assertJsonValidationErrors(['code']);
});

it('updates an academic year', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $academicYear = AcademicYear::factory()->create([
        'code' => 'AY 2024-2025',
        'description' => 'Old description',
        'status' => 'inactive',
    ]);

    $response = $this->withHeaders(apiAs($admin))->postJson("/api/admin/academic-years/{$academicYear->id}", [
        'code' => 'AY 2025-2026',
        'description' => 'School Year 2025-2026',
        'status' => 'active',
    ]);

    $response->assertOk()
        ->assertJsonPath('data.code', 'AY 2025-2026')
        ->assertJsonPath('data.description', 'School Year 2025-2026')
        ->assertJsonPath('data.status', 'active');

    $academicYear->refresh();
    $this->assertSame('active', $academicYear->status);
});

it('allows keeping the same code on update', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $academicYear = AcademicYear::factory()->create(['code' => 'AY 2025-2026']);

    $this->withHeaders(apiAs($admin))->postJson("/api/admin/academic-years/{$academicYear->id}", [
        'code' => 'AY 2025-2026',
        'description' => 'Still the same.',
    ])->assertOk();
});

it('deletes an academic year', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $academicYear = AcademicYear::factory()->create(['status' => 'inactive']);

    $this->withHeaders(apiAs($admin))->deleteJson("/api/admin/academic-years/{$academicYear->id}")
        ->assertOk()
        ->assertJsonPath('message', 'Academic year deleted.');

    $this->assertDatabaseMissing('academic_years', ['id' => $academicYear->id]);
});

it('blocks deleting an academic year with enrolled students', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $academicYear = AcademicYear::factory()->create(['status' => 'inactive']);

    Student::factory()->create(['academic_year_id' => $academicYear->id]);

    $this->withHeaders(apiAs($admin))->deleteJson("/api/admin/academic-years/{$academicYear->id}")
        ->assertStatus(422)
        ->assertJsonValidationErrors(['status']);

    $this->assertDatabaseHas('academic_years', ['id' => $academicYear->id]);
});

it('deactivates the previously active academic year when creating a new active one', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $current = AcademicYear::factory()->create(['status' => 'active']);

    $this->withHeaders(apiAs($admin))->postJson('/api/admin/academic-years', [
        'code' => 'AY 2026-2027',
        'description' => 'School Year 2026-2027',
        'status' => 'active',
    ])->assertStatus(201)
        ->assertJsonPath('data.status', 'active');

    $this->assertSame('inactive', $current->fresh()->status);
    $this->assertSame(1, AcademicYear::where('status', 'active')->count());
});

it('deactivates other active academic years when updating one to active', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $current = AcademicYear::factory()->create(['status' => 'active']);
    $target = AcademicYear::factory()->create(['status' => 'inactive']);

    $this->withHeaders(apiAs($admin))->postJson("/api/admin/academic-years/{$target->id}", [
        'code' => $target->code,
        'description' => $target->description,
        'status' => 'active',
    ])->assertOk()
        ->assertJsonPath('data.status', 'active');

    $this->assertSame('inactive', $current->fresh()->status);
    $this->assertSame(1, AcademicYear::where('status', 'active')->count());
});

it('prevents deactivating the last active academic year', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $academicYear = AcademicYear::factory()->create(['status' => 'active']);

    $this->withHeaders(apiAs($admin))->postJson("/api/admin/academic-years/{$academicYear->id}", [
        'code' => $academicYear->code,
        'description' => $academicYear->description,
        'status' => 'inactive',
    ])->assertStatus(422)
        ->assertJsonValidationErrors(['status']);

    $this->assertSame('active', $academicYear->fresh()->status);
});

it('prevents deleting the last active academic year', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $academicYear = AcademicYear::factory()->create(['status' => 'active']);

    $this->withHeaders(apiAs($admin))->deleteJson("/api/admin/academic-years/{$academicYear->id}")
        ->assertStatus(422)
        ->assertJsonValidationErrors(['status']);

    $this->assertDatabaseHas('academic_years', ['id' => $academicYear->id]);
});

it('seeds the default academic years with exactly one active', function () {
    $this->seed(AcademicYearSeeder::class);

    expect(AcademicYear::count())->toBe(4)
        ->and(AcademicYear::where('code', '251')->where('description', '1ST SEM AY 2025-2026')->exists())->toBeTrue()
        ->and(AcademicYear::where('code', '252')->where('description', '2ND SEM AY 2025-2026')->exists())->toBeTrue()
        ->and(AcademicYear::where('code', '253')->where('description', 'SUMMER AY 2025-2026')->exists())->toBeTrue()
        ->and(AcademicYear::where('code', '261')->where('description', '1ST SEM AY 2026-2027')->exists())->toBeTrue()
        ->and(AcademicYear::where('code', '261')->where('status', 'active')->exists())->toBeTrue()
        ->and(AcademicYear::where('status', 'active')->count())->toBe(1);
});

it('forbids non-admin users from managing academic years', function () {
    $guard = User::factory()->create(['role' => 'guard']);

    $this->withHeaders(apiAs($guard))->getJson('/api/admin/academic-years')->assertStatus(403);
    $this->withHeaders(apiAs($guard))->postJson('/api/admin/academic-years', ['code' => 'Test'])->assertStatus(403);
});
