<?php

use App\Models\ViolationType;
use Database\Seeders\ViolationTypeSeeder;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('can create an active violation type', function () {
    $type = ViolationType::create([
        'name' => 'Incomplete uniform',
        'description' => 'Uniform pieces missing.',
        'is_active' => true,
    ]);

    expect($type->is_active)->toBeTrue()
        ->and($type->fresh()->is_active)->toBeTrue()
        ->and($type->name)->toBe('Incomplete uniform');
});

it('casts is_active to boolean', function () {
    $type = ViolationType::create([
        'name' => 'No ID worn',
        'is_active' => false,
    ]);

    expect($type->is_active)->toBeFalse();
});

it('factory creates active types by default and inactive with state', function () {
    $active = ViolationType::factory()->create();
    $inactive = ViolationType::factory()->inactive()->create();

    expect($active->is_active)->toBeTrue()
        ->and($inactive->is_active)->toBeFalse();
});

it('enforces a unique name', function () {
    ViolationType::factory()->create(['name' => 'Late arrival']);

    expect(fn () => ViolationType::create(['name' => 'Late arrival']))
        ->toThrow(QueryException::class, 'UNIQUE constraint failed');
});

it('seeds the default violation types', function () {
    $this->seed(ViolationTypeSeeder::class);

    expect(ViolationType::count())->toBe(21)
        ->and(ViolationType::where('name', 'Incomplete uniform')->exists())->toBeTrue()
        ->and(ViolationType::where('name', 'Cutting classes')->exists())->toBeTrue()
        ->and(ViolationType::where('name', 'Other')->exists())->toBeTrue()
        ->and(ViolationType::where('is_active', true)->count())->toBe(21);
});
