<?php

namespace Database\Seeders;

use App\Models\ViolationType;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ViolationTypeSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the default violation types.
     *
     * @return array<int, array{name: string, description: string}>
     */
    private function types(): array
    {
        return [
            ['name' => 'Failure to Wear Prescribed Uniform', 'description' => 'Not wearing the uniform prescribed by the school dress code.'],
            ['name' => 'Failure to Wear School ID', 'description' => 'Student ID not worn while inside the campus.'],
            ['name' => 'Failure to Wear Prescribed Footwear', 'description' => 'Not wearing the footwear prescribed by the school.'],
            ['name' => 'Improper Upper Garment', 'description' => 'Wearing an upper garment that deviates from the prescribed uniform.'],
            ['name' => 'Improper Lower Garment', 'description' => 'Wearing a lower garment that deviates from the prescribed uniform.'],
            ['name' => 'Other', 'description' => 'Any violation that does not fit the predefined types.'],
        ];
    }

    /**
     * Seed the default violation types.
     */
    public function run(): void
    {
        $types = $this->types();

        ViolationType::whereNotIn('name', array_column($types, 'name'))->delete();

        foreach ($types as $type) {
            ViolationType::updateOrCreate(
                ['name' => $type['name']],
                $type
            );
        }
    }
}
