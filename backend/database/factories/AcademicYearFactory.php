<?php

namespace Database\Factories;

use App\Models\AcademicYear;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AcademicYear>
 */
class AcademicYearFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startYear = fake()->numberBetween(2020, 2028);

        return [
            'code' => fake()->unique()->regexify("AY {$startYear}-\d{2}"),
            'description' => 'School year '.$startYear.'-'.($startYear + 1).'.',
            'status' => fake()->randomElement(['active', 'inactive']),
        ];
    }

    /**
     * Indicate that the academic year is active.
     */
    public function active(): static
    {
        return $this->state(fn (): array => ['status' => 'active']);
    }

    /**
     * Indicate that the academic year is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (): array => ['status' => 'inactive']);
    }
}
