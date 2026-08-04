<?php

namespace Database\Seeders;

use App\Models\AcademicYear;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AcademicYearSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the default academic years.
     *
     * @return array<int, array{code: string, description: string, status: string}>
     */
    private function academicYears(): array
    {
        return [
            ['code' => '251', 'description' => '1ST SEM AY 2025-2026', 'status' => 'inactive'],
            ['code' => '252', 'description' => '2ND SEM AY 2025-2026', 'status' => 'inactive'],
            ['code' => '253', 'description' => 'SUMMER AY 2025-2026', 'status' => 'inactive'],
            ['code' => '261', 'description' => '1ST SEM AY 2026-2027', 'status' => 'active'],
        ];
    }

    /**
     * Seed the default academic years.
     */
    public function run(): void
    {
        foreach ($this->academicYears() as $academicYear) {
            AcademicYear::updateOrCreate(
                ['code' => $academicYear['code']],
                $academicYear
            );
        }
    }
}
