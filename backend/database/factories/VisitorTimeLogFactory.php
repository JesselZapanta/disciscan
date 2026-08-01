<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\VisitorRegistration;
use App\Models\VisitorTimeLog;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<VisitorTimeLog>
 */
class VisitorTimeLogFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'visitor_registration_id' => VisitorRegistration::factory(),
            'type' => fake()->randomElement(['in', 'out']),
            'time' => now(),
            'performed_by' => User::factory(),
        ];
    }
}
