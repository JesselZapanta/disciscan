<?php

namespace Database\Seeders;

use App\Models\AcademicYear;
use App\Models\Student;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class StudentSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the default students.
     *
     * @return array<int, array{id_number: string, firstname: string, middlename: string, lastname: string, contact_no: string, program_and_year: string}>
     */
    private function students(): array
    {
        return [
            ['id_number' => '261001', 'firstname' => 'Juan', 'middlename' => 'Dela Cruz', 'lastname' => 'Santos', 'contact_no' => '09171234567', 'program_and_year' => 'BSCS 1'],
            ['id_number' => '261002', 'firstname' => 'Maria', 'middlename' => 'Lopez', 'lastname' => 'Reyes', 'contact_no' => '09181234567', 'program_and_year' => 'BSCS 1'],
            ['id_number' => '251001', 'firstname' => 'Pedro', 'middlename' => 'Garcia', 'lastname' => 'Mendoza', 'contact_no' => '09191234567', 'program_and_year' => 'BSCS 2'],
        ];
    }

    /**
     * Seed the default students.
     */
    public function run(): void
    {
        $academicYear = AcademicYear::where('code', '261')->firstOrFail();

        foreach ($this->students() as $student) {
            Student::updateOrCreate(
                ['id_number' => $student['id_number']],
                [...$student, 'academic_year_id' => $academicYear->id]
            );
        }
    }
}
