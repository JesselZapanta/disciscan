<?php

namespace Database\Factories;

use App\Models\AcademicYear;
use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Student>
 */
class StudentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'id_number' => fake()->unique()->numerify('#######'),
            'firstname' => fake()->firstName(),
            'middlename' => fake()->optional()->lastName(),
            'lastname' => fake()->lastName(),
            'contact_no' => fake()->regexify('09[0-9]{9}'),
            'program_and_year' => fake()->randomElement(['BSIT 1A', 'BSIT 2B', 'BSCS 3A', 'BSBA 1A', 'BSEd 4A', 'BSN 2A']),
            'academic_year_id' => AcademicYear::factory(),
        ];
    }
}
