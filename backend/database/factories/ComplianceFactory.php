<?php

namespace Database\Factories;

use App\Models\Compliance;
use App\Models\Room;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Compliance>
 */
class ComplianceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'room_id' => Room::factory(),
            'issues' => fake()->sentence(4),
            'remarks' => fake()->optional()->sentence(6),
            'status' => fake()->randomElement(['Non-Compliant', 'Resolved']),
            'recorded_by' => fake()->name(),
        ];
    }
}
