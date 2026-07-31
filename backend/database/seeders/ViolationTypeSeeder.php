<?php

namespace Database\Seeders;

use App\Models\ViolationType;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ViolationTypeSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the default violation types.
     *
     * @return array<int, array{name: string, description: string}>
     */
    private function types(): array
    {
        return [
            ['name' => 'Incomplete uniform', 'description' => 'Uniform pieces missing or not worn per school dress code.'],
            ['name' => 'No ID worn', 'description' => 'Student ID not displayed while inside the campus.'],
            ['name' => 'Late arrival', 'description' => 'Arrived after the scheduled start of class.'],
            ['name' => 'Cutting classes', 'description' => 'Skipping or leaving a class without permission.'],
            ['name' => 'Truancy', 'description' => 'Unauthorized absence from school.'],
            ['name' => 'Vandalism', 'description' => 'Defacing, damaging, or marking school property.'],
            ['name' => 'Bullying', 'description' => 'Repeated aggressive behavior toward another student.'],
            ['name' => 'Physical altercation', 'description' => 'Fighting or physical confrontation with another student.'],
            ['name' => 'Disrespectful conduct', 'description' => 'Showing disrespect toward teachers or school personnel.'],
            ['name' => 'Cheating during examinations', 'description' => 'Using unauthorized aids or copying during exams.'],
            ['name' => 'Plagiarism', 'description' => 'Submitting copied work without proper citation.'],
            ['name' => 'Use of mobile phone during class', 'description' => 'Using a mobile device during class hours without permission.'],
            ['name' => 'Smoking within campus', 'description' => 'Smoking or vaping inside the school premises.'],
            ['name' => 'Possession of prohibited items', 'description' => 'Carrying items banned by school policy.'],
            ['name' => 'Gambling', 'description' => 'Participating in any form of gambling on campus.'],
            ['name' => 'Littering', 'description' => 'Improper disposal of waste within the campus.'],
            ['name' => 'Unauthorized entry', 'description' => 'Entering restricted areas or the campus without permission.'],
            ['name' => 'Damage to school property', 'description' => 'Causing damage to school facilities or equipment.'],
            ['name' => 'Forgery of documents', 'description' => 'Falsifying signatures, IDs, or school documents.'],
            ['name' => 'Insubordination', 'description' => 'Refusing to follow lawful instructions from school authorities.'],
            ['name' => 'Other', 'description' => 'Any violation that does not fit the predefined types.'],
        ];
    }

    /**
     * Seed the default violation types.
     */
    public function run(): void
    {
        foreach ($this->types() as $type) {
            ViolationType::updateOrCreate(
                ['name' => $type['name']],
                $type
            );
        }
    }
}
