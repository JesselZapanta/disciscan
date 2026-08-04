<?php

namespace Database\Seeders;

use App\Models\AcademicYear;
use Illuminate\Database\Seeder;

class AcademicYearSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        AcademicYear::create([
            'code' => '251',
            'description' => '1ST SEM AY 2025-2026',
            'status' => 'inactive',
        ]);

        AcademicYear::create([
            'code' => '252',
            'description' => '2ND SEM AY 2025-2026',
            'status' => 'inactive',
        ]);

        AcademicYear::create([
            'code' => '253',
            'description' => 'SUMMER AY 2025-2026',
            'status' => 'inactive',
        ]);

        AcademicYear::create([
            'code' => '261',
            'description' => '1ST SEM AY 2026-2027',
            'status' => 'active',
        ]);
    }
}
