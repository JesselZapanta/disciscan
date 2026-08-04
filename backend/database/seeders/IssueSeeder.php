<?php

namespace Database\Seeders;

use App\Models\Issue;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class IssueSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the default issues.
     *
     * @return array<int, array{name: string, description: string, status: string}>
     */
    private function issues(): array
    {
        return [
            ['name' => 'Lights left on', 'description' => 'Room lights were left on with no occupants present.', 'status' => 'Active'],
            ['name' => 'Computers left on', 'description' => 'Computers were left running after class ended.', 'status' => 'Active'],
            ['name' => 'Aircon left on', 'description' => 'Air conditioning unit left on with no occupants present.', 'status' => 'Active'],
            ['name' => 'Windows not locked', 'description' => 'Windows were left unlocked after the room was vacated.', 'status' => 'Active'],
            ['name' => 'Equipment improperly used', 'description' => 'Equipment was found used in an improper manner.', 'status' => 'Active'],
            ['name' => 'Others', 'description' => 'Other miscellaneous issue not covered by the categories above.', 'status' => 'Active'],
        ];
    }

    /**
     * Seed the default issues.
     */
    public function run(): void
    {
        foreach ($this->issues() as $issue) {
            Issue::updateOrCreate(
                ['name' => $issue['name']],
                $issue
            );
        }
    }
}
