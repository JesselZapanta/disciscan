<?php

namespace Database\Factories;

use App\Models\Student;
use App\Models\StudentViolation;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<StudentViolation>
 */
class StudentViolationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'student_id' => Student::factory(),
            'violation_type_ids' => [],
            'remarks' => fake()->optional()->sentence(),
            'status' => StudentViolation::STATUS_NON_COMPLIANT,
            'recorded_by' => null,
        ];
    }
}
