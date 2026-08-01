<?php

namespace Database\Factories;

use App\Models\VisitorRegistration;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<VisitorRegistration>
 */
class VisitorRegistrationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'fullname' => fake()->name(),
            'contact' => fake()->phoneNumber(),
            'purpose' => fake()->randomElement([
                'Meeting with faculty/staff',
                'Parent / guardian visit',
                'Delivery',
                'Event attendance',
                'Other',
            ]),
            'purpose_other' => null,
            'person_office_to_visit' => fake()->randomElement([
                'Registrar\'s Office',
                'Guidance Office',
                'Dean\'s Office',
                'Library',
            ]),
            'id_type' => fake()->randomElement([
                "Driver's License",
                'Passport',
                'National ID',
                'UMID (SSS)',
                'PRC License',
                'Postal ID',
                'TIN ID',
                'School ID',
            ]),
            'id_number' => fake()->numerify('####-####-####'),
            'visit_date' => fake()->date(),
            'status' => fake()->randomElement(['pending', 'checked_in', 'checked_out']),
        ];
    }
}
