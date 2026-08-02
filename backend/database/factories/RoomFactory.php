<?php

namespace Database\Factories;

use App\Models\Room;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Room>
 */
class RoomFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $building = fake()->randomElement(['Main Building', 'Asenso Building', 'Annex Building']);
        $floor = fake()->randomElement(['1st', '2nd', '3rd']);
        $prefix = match ($building) {
            'Asenso Building' => 'AS',
            'Annex Building' => 'AN',
            default => 'MB',
        };
        $floorNumber = match ($floor) {
            '2nd' => 2,
            '3rd' => 3,
            default => 1,
        };
        $suffix = fake()->unique()->numberBetween(1, 89);

        return [
            'room_name' => "{$prefix}-{$floorNumber}{$floorNumber}{$suffix}",
            'building' => $building,
            'floor' => $floor,
            'type' => fake()->randomElement(['Lecture Room', 'Laboratory', 'Office']),
            'status' => fake()->randomElement(['Active', 'Active', 'Active', 'Inactive']),
        ];
    }
}
