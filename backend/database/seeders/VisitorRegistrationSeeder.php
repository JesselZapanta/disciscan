<?php

namespace Database\Seeders;

use App\Models\VisitorRegistration;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class VisitorRegistrationSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the default visitor registrations.
     *
     * @return array<int, array{fullname: string, contact: string, purpose: string, purpose_other: string|null, person_office_to_visit: string, id_type: string, id_number: string, visit_date: string, type: string, status: string}>
     */
    private function visitors(): array
    {
        return [
            [
                'fullname' => 'Romel Ondona',
                'contact' => '09123456789',
                'purpose' => 'Meeting with faculty/staff',
                'purpose_other' => null,
                'person_office_to_visit' => "Registrar's Office",
                'id_type' => 'National ID',
                'id_number' => '02120-01200-6400',
                'visit_date' => '2026-08-01',
                'type' => 'visitor',
                'status' => 'pending',
            ],
        ];
    }

    /**
     * Seed the default visitor registrations.
     */
    public function run(): void
    {
        foreach ($this->visitors() as $visitor) {
            VisitorRegistration::updateOrCreate(
                ['fullname' => $visitor['fullname'], 'visit_date' => $visitor['visit_date']],
                $visitor
            );
        }
    }
}
