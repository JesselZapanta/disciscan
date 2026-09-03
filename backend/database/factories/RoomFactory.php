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
        $building = fake()->randomElement(['Main Building', 'Annex Building', 'Senior High School Building', 'Asenso Building']);
        $floor = fake()->randomElement(['1st', '2nd', '3rd', 'Ground Floor', 'Second Floor', 'Third Floor']);
        $prefix = match ($building) {
            'Asenso Building' => 'AS',
            'Annex Building' => 'AB',
            'Senior High School Building' => 'SHS',
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
            'type' => fake()->randomElement(['Lecture Room', 'Laboratory', 'Office', 'Facility']),
            'status' => fake()->randomElement(['Active', 'Active', 'Active', 'Inactive']),
        ];
    }
}
