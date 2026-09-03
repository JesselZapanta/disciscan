<?php

namespace Database\Seeders;

use App\Models\Room;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoomSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * @return array<int, array{room_name: string, building: string, floor: string, type: string, status: string}>
     */
    private function rooms(): array
    {
        return [
            // Annex Building — Ground Floor
            ['room_name' => 'AB-102', 'building' => 'Annex Building', 'floor' => 'Ground Floor', 'type' => 'Lecture Room', 'status' => 'Active'],
            ['room_name' => 'AB-103', 'building' => 'Annex Building', 'floor' => 'Ground Floor', 'type' => 'Lecture Room', 'status' => 'Active'],
            ['room_name' => 'AB-104', 'building' => 'Annex Building', 'floor' => 'Ground Floor', 'type' => 'Lecture Room', 'status' => 'Active'],
            ['room_name' => 'AB-105', 'building' => 'Annex Building', 'floor' => 'Ground Floor', 'type' => 'Lecture Room', 'status' => 'Active'],
            ['room_name' => 'ROTC Office', 'building' => 'Annex Building', 'floor' => 'Ground Floor', 'type' => 'Office', 'status' => 'Active'],
            ['room_name' => 'ARMORY', 'building' => 'Annex Building', 'floor' => 'Ground Floor', 'type' => 'Office', 'status' => 'Active'],
            ['room_name' => 'Crim Lab', 'building' => 'Annex Building', 'floor' => 'Ground Floor', 'type' => 'Laboratory', 'status' => 'Active'],
            ['room_name' => 'Crim Lab 1', 'building' => 'Annex Building', 'floor' => 'Ground Floor', 'type' => 'Laboratory', 'status' => 'Active'],
            ['room_name' => 'Crim Lab 2', 'building' => 'Annex Building', 'floor' => 'Ground Floor', 'type' => 'Laboratory', 'status' => 'Active'],
            ['room_name' => 'Crim Lab 3', 'building' => 'Annex Building', 'floor' => 'Ground Floor', 'type' => 'Laboratory', 'status' => 'Active'],
            ['room_name' => 'Crim Lab 4', 'building' => 'Annex Building', 'floor' => 'Ground Floor', 'type' => 'Laboratory', 'status' => 'Active'],
            ['room_name' => 'Rest Rooms (Annex Ground Floor)', 'building' => 'Annex Building', 'floor' => 'Ground Floor', 'type' => 'Facility', 'status' => 'Active'],

            // Annex Building — Second Floor
            ['room_name' => 'AB-201', 'building' => 'Annex Building', 'floor' => 'Second Floor', 'type' => 'Lecture Room', 'status' => 'Active'],
            ['room_name' => 'AB-202', 'building' => 'Annex Building', 'floor' => 'Second Floor', 'type' => 'Lecture Room', 'status' => 'Active'],
            ['room_name' => 'AB-203', 'building' => 'Annex Building', 'floor' => 'Second Floor', 'type' => 'Lecture Room', 'status' => 'Active'],
            ['room_name' => 'AB-204', 'building' => 'Annex Building', 'floor' => 'Second Floor', 'type' => 'Lecture Room', 'status' => 'Active'],
            ['room_name' => 'AB-205', 'building' => 'Annex Building', 'floor' => 'Second Floor', 'type' => 'Lecture Room', 'status' => 'Active'],
            ['room_name' => 'AB-206', 'building' => 'Annex Building', 'floor' => 'Second Floor', 'type' => 'Lecture Room', 'status' => 'Active'],
            ['room_name' => 'AB-207', 'building' => 'Annex Building', 'floor' => 'Second Floor', 'type' => 'Lecture Room', 'status' => 'Active'],
            ['room_name' => 'AB-208', 'building' => 'Annex Building', 'floor' => 'Second Floor', 'type' => 'Lecture Room', 'status' => 'Active'],
            ['room_name' => 'AB-209', 'building' => 'Annex Building', 'floor' => 'Second Floor', 'type' => 'Lecture Room', 'status' => 'Active'],
            ['room_name' => 'AB-210', 'building' => 'Annex Building', 'floor' => 'Second Floor', 'type' => 'Lecture Room', 'status' => 'Active'],
            ['room_name' => 'Rest Rooms (Annex Second Floor)', 'building' => 'Annex Building', 'floor' => 'Second Floor', 'type' => 'Facility', 'status' => 'Active'],

            // Senior High School Building — Ground Floor
            ['room_name' => 'SHS-101', 'building' => 'Senior High School Building', 'floor' => 'Ground Floor', 'type' => 'Lecture Room', 'status' => 'Active'],
            ['room_name' => 'SHS-102', 'building' => 'Senior High School Building', 'floor' => 'Ground Floor', 'type' => 'Lecture Room', 'status' => 'Active'],
            ['room_name' => 'Rest Room (SHS Ground Floor)', 'building' => 'Senior High School Building', 'floor' => 'Ground Floor', 'type' => 'Facility', 'status' => 'Active'],

            // Senior High School Building — Second Floor
            ['room_name' => 'SHS-201', 'building' => 'Senior High School Building', 'floor' => 'Second Floor', 'type' => 'Lecture Room', 'status' => 'Active'],
            ['room_name' => 'SHS-202', 'building' => 'Senior High School Building', 'floor' => 'Second Floor', 'type' => 'Lecture Room', 'status' => 'Active'],
            ['room_name' => 'Rest Room (SHS Second Floor)', 'building' => 'Senior High School Building', 'floor' => 'Second Floor', 'type' => 'Facility', 'status' => 'Active'],

            // Main Building — Ground Floor — Left Side
            ['room_name' => 'OJT & Placement Alumni Affairs', 'building' => 'Main Building', 'floor' => 'Ground Floor', 'type' => 'Office', 'status' => 'Active'],
            ['room_name' => 'Scholarship & Welfare Office', 'building' => 'Main Building', 'floor' => 'Ground Floor', 'type' => 'Office', 'status' => 'Active'],
            ['room_name' => 'Records Section', 'building' => 'Main Building', 'floor' => 'Ground Floor', 'type' => 'Office', 'status' => 'Active'],
            ['room_name' => 'College Registrar', 'building' => 'Main Building', 'floor' => 'Ground Floor', 'type' => 'Office', 'status' => 'Active'],
            ['room_name' => 'Accounting & Cashier', 'building' => 'Main Building', 'floor' => 'Ground Floor', 'type' => 'Office', 'status' => 'Active'],
            ['room_name' => 'VP for Administration and Finance', 'building' => 'Main Building', 'floor' => 'Ground Floor', 'type' => 'Office', 'status' => 'Active'],
            ['room_name' => 'Security Services NC II Assessment Center', 'building' => 'Main Building', 'floor' => 'Ground Floor', 'type' => 'Office', 'status' => 'Active'],
            ['room_name' => 'Institute of Criminal Justice Education', 'building' => 'Main Building', 'floor' => 'Ground Floor', 'type' => 'Office', 'status' => 'Active'],
            ['room_name' => 'Student Affairs Office', 'building' => 'Main Building', 'floor' => 'Ground Floor', 'type' => 'Office', 'status' => 'Active'],
            ['room_name' => 'Institute of Computer Studies', 'building' => 'Main Building', 'floor' => 'Ground Floor', 'type' => 'Office', 'status' => 'Active'],
            ['room_name' => 'GADTC Development Training Center', 'building' => 'Main Building', 'floor' => 'Ground Floor', 'type' => 'Office', 'status' => 'Active'],
            ['room_name' => 'Institute of Midwifery', 'building' => 'Main Building', 'floor' => 'Ground Floor', 'type' => 'Office', 'status' => 'Active'],
            ['room_name' => 'Institute of Business and Financial Services', 'building' => 'Main Building', 'floor' => 'Ground Floor', 'type' => 'Office', 'status' => 'Active'],
            ['room_name' => 'Institute of Teacher Education', 'building' => 'Main Building', 'floor' => 'Ground Floor', 'type' => 'Office', 'status' => 'Active'],
            ['room_name' => 'Institute of Arts and Sciences', 'building' => 'Main Building', 'floor' => 'Ground Floor', 'type' => 'Office', 'status' => 'Active'],
            ['room_name' => 'Rest Rooms (Main Ground Floor Left)', 'building' => 'Main Building', 'floor' => 'Ground Floor', 'type' => 'Facility', 'status' => 'Active'],
            ['room_name' => 'Food Court', 'building' => 'Main Building', 'floor' => 'Ground Floor', 'type' => 'Facility', 'status' => 'Active'],

            // Main Building — Ground Floor — Right Side
            ['room_name' => 'Medical and Dental Clinic', 'building' => 'Main Building', 'floor' => 'Ground Floor', 'type' => 'Facility', 'status' => 'Active'],
            ['room_name' => 'MB-105', 'building' => 'Main Building', 'floor' => 'Ground Floor', 'type' => 'Lecture Room', 'status' => 'Active'],
            ['room_name' => 'MB-103 (Demo Room)', 'building' => 'Main Building', 'floor' => 'Ground Floor', 'type' => 'Lecture Room', 'status' => 'Active'],
            ['room_name' => 'MB-102 (Midwifery Skills Laboratory)', 'building' => 'Main Building', 'floor' => 'Ground Floor', 'type' => 'Laboratory', 'status' => 'Active'],
            ['room_name' => 'PFOM', 'building' => 'Main Building', 'floor' => 'Ground Floor', 'type' => 'Office', 'status' => 'Active'],
            ['room_name' => 'Maintenance/Student Assistant', 'building' => 'Main Building', 'floor' => 'Ground Floor', 'type' => 'Office', 'status' => 'Active'],
            ['room_name' => 'Dance Studio', 'building' => 'Main Building', 'floor' => 'Ground Floor', 'type' => 'Laboratory', 'status' => 'Active'],
            ['room_name' => 'Music Room', 'building' => 'Main Building', 'floor' => 'Ground Floor', 'type' => 'Laboratory', 'status' => 'Active'],
            ['room_name' => 'Audio Visual Room', 'building' => 'Main Building', 'floor' => 'Ground Floor', 'type' => 'Laboratory', 'status' => 'Active'],
            ['room_name' => 'College Information System Office', 'building' => 'Main Building', 'floor' => 'Ground Floor', 'type' => 'Office', 'status' => 'Active'],
            ['room_name' => 'Quality Management Development Office', 'building' => 'Main Building', 'floor' => 'Ground Floor', 'type' => 'Office', 'status' => 'Active'],
            ['room_name' => 'Accreditation Room', 'building' => 'Main Building', 'floor' => 'Ground Floor', 'type' => 'Office', 'status' => 'Active'],
            ['room_name' => 'Rest Rooms (Main Ground Floor Right)', 'building' => 'Main Building', 'floor' => 'Ground Floor', 'type' => 'Facility', 'status' => 'Active'],
            ['room_name' => 'Elevator (Main Ground Floor)', 'building' => 'Main Building', 'floor' => 'Ground Floor', 'type' => 'Facility', 'status' => 'Active'],

            // Main Building — Second Floor — Left Side
            ['room_name' => 'VP for Academic Affairs', 'building' => 'Main Building', 'floor' => 'Second Floor', 'type' => 'Office', 'status' => 'Active'],
            ['room_name' => "Dean's Office", 'building' => 'Main Building', 'floor' => 'Second Floor', 'type' => 'Office', 'status' => 'Active'],
            ['room_name' => 'MB-214', 'building' => 'Main Building', 'floor' => 'Second Floor', 'type' => 'Lecture Room', 'status' => 'Active'],
            ['room_name' => 'MB-212', 'building' => 'Main Building', 'floor' => 'Second Floor', 'type' => 'Lecture Room', 'status' => 'Active'],
            ['room_name' => 'MB-210 (Steno Lab)', 'building' => 'Main Building', 'floor' => 'Second Floor', 'type' => 'Laboratory', 'status' => 'Active'],
            ['room_name' => 'MB-208', 'building' => 'Main Building', 'floor' => 'Second Floor', 'type' => 'Lecture Room', 'status' => 'Active'],
            ['room_name' => 'MB-206 (Business Center)', 'building' => 'Main Building', 'floor' => 'Second Floor', 'type' => 'Laboratory', 'status' => 'Active'],
            ['room_name' => 'MB-204', 'building' => 'Main Building', 'floor' => 'Second Floor', 'type' => 'Lecture Room', 'status' => 'Active'],
            ['room_name' => 'Moot Court', 'building' => 'Main Building', 'floor' => 'Second Floor', 'type' => 'Laboratory', 'status' => 'Active'],
            ['room_name' => 'Guidance Office', 'building' => 'Main Building', 'floor' => 'Second Floor', 'type' => 'Office', 'status' => 'Active'],
            ['room_name' => 'MB-203 (Computer Laboratory 5)', 'building' => 'Main Building', 'floor' => 'Second Floor', 'type' => 'Laboratory', 'status' => 'Active'],
            ['room_name' => 'MB-205 (Computer Laboratory 4)', 'building' => 'Main Building', 'floor' => 'Second Floor', 'type' => 'Laboratory', 'status' => 'Active'],
            ['room_name' => 'MB-207 (Computer Laboratory 3)', 'building' => 'Main Building', 'floor' => 'Second Floor', 'type' => 'Laboratory', 'status' => 'Active'],
            ['room_name' => 'MB-209 (Computer Laboratory 2)', 'building' => 'Main Building', 'floor' => 'Second Floor', 'type' => 'Laboratory', 'status' => 'Active'],
            ['room_name' => 'MB-209 (Math Lab)', 'building' => 'Main Building', 'floor' => 'Second Floor', 'type' => 'Laboratory', 'status' => 'Active'],
            ['room_name' => 'Rest Rooms (Main Second Floor Left)', 'building' => 'Main Building', 'floor' => 'Second Floor', 'type' => 'Facility', 'status' => 'Active'],
            ['room_name' => 'VIP Lounge', 'building' => 'Main Building', 'floor' => 'Second Floor', 'type' => 'Facility', 'status' => 'Active'],
            ['room_name' => "Visitor's Lounge", 'building' => 'Main Building', 'floor' => 'Second Floor', 'type' => 'Facility', 'status' => 'Active'],
            ['room_name' => 'Elevator (Main Second Floor)', 'building' => 'Main Building', 'floor' => 'Second Floor', 'type' => 'Facility', 'status' => 'Active'],

            // Main Building — Second Floor — Right Side
            ['room_name' => 'Faculty & Staff Lounge', 'building' => 'Main Building', 'floor' => 'Second Floor', 'type' => 'Facility', 'status' => 'Active'],
            ['room_name' => 'Speech Laboratory', 'building' => 'Main Building', 'floor' => 'Second Floor', 'type' => 'Laboratory', 'status' => 'Active'],
            ['room_name' => 'MB-208 (Second Floor Right)', 'building' => 'Main Building', 'floor' => 'Second Floor', 'type' => 'Lecture Room', 'status' => 'Active'],
            ['room_name' => 'MB-226 (Demo Room)', 'building' => 'Main Building', 'floor' => 'Second Floor', 'type' => 'Lecture Room', 'status' => 'Active'],
            ['room_name' => 'College Athletics Office', 'building' => 'Main Building', 'floor' => 'Second Floor', 'type' => 'Office', 'status' => 'Active'],
            ['room_name' => 'Executive Vice President Office', 'building' => 'Main Building', 'floor' => 'Second Floor', 'type' => 'Office', 'status' => 'Active'],
            ['room_name' => 'VP for Planning Office', 'building' => 'Main Building', 'floor' => 'Second Floor', 'type' => 'Office', 'status' => 'Active'],
            ['room_name' => 'Supply & Property Management Office', 'building' => 'Main Building', 'floor' => 'Second Floor', 'type' => 'Office', 'status' => 'Active'],
            ['room_name' => 'Faculty Room', 'building' => 'Main Building', 'floor' => 'Second Floor', 'type' => 'Office', 'status' => 'Active'],
            ['room_name' => 'Human Resource Office', 'building' => 'Main Building', 'floor' => 'Second Floor', 'type' => 'Office', 'status' => 'Active'],
            ['room_name' => 'Board Room', 'building' => 'Main Building', 'floor' => 'Second Floor', 'type' => 'Office', 'status' => 'Active'],
            ['room_name' => "College President's Office", 'building' => 'Main Building', 'floor' => 'Second Floor', 'type' => 'Office', 'status' => 'Active'],
            ['room_name' => 'Rest Rooms (Main Second Floor Right)', 'building' => 'Main Building', 'floor' => 'Second Floor', 'type' => 'Facility', 'status' => 'Active'],

            // Main Building — Third Floor
            ['room_name' => 'Community and Academic Extension Services Office', 'building' => 'Main Building', 'floor' => 'Third Floor', 'type' => 'Office', 'status' => 'Active'],
            ['room_name' => 'MB-307', 'building' => 'Main Building', 'floor' => 'Third Floor', 'type' => 'Lecture Room', 'status' => 'Active'],
            ['room_name' => 'MB-306', 'building' => 'Main Building', 'floor' => 'Third Floor', 'type' => 'Lecture Room', 'status' => 'Active'],
            ['room_name' => 'MB-305', 'building' => 'Main Building', 'floor' => 'Third Floor', 'type' => 'Lecture Room', 'status' => 'Active'],
            ['room_name' => 'MB-304', 'building' => 'Main Building', 'floor' => 'Third Floor', 'type' => 'Lecture Room', 'status' => 'Active'],
            ['room_name' => 'MB-303', 'building' => 'Main Building', 'floor' => 'Third Floor', 'type' => 'Lecture Room', 'status' => 'Active'],
            ['room_name' => 'Science Laboratory', 'building' => 'Main Building', 'floor' => 'Third Floor', 'type' => 'Laboratory', 'status' => 'Active'],
            ['room_name' => 'MB-301', 'building' => 'Main Building', 'floor' => 'Third Floor', 'type' => 'Lecture Room', 'status' => 'Active'],
            ['room_name' => 'Library Extension 1', 'building' => 'Main Building', 'floor' => 'Third Floor', 'type' => 'Facility', 'status' => 'Active'],
            ['room_name' => 'Library', 'building' => 'Main Building', 'floor' => 'Third Floor', 'type' => 'Facility', 'status' => 'Active'],
            ['room_name' => 'Library Extension 2', 'building' => 'Main Building', 'floor' => 'Third Floor', 'type' => 'Facility', 'status' => 'Active'],
            ['room_name' => 'Chapel', 'building' => 'Main Building', 'floor' => 'Third Floor', 'type' => 'Facility', 'status' => 'Active'],
            ['room_name' => 'Rest Rooms (Main Third Floor)', 'building' => 'Main Building', 'floor' => 'Third Floor', 'type' => 'Facility', 'status' => 'Active'],
            ['room_name' => 'Activity Hall', 'building' => 'Main Building', 'floor' => 'Third Floor', 'type' => 'Facility', 'status' => 'Active'],
            ['room_name' => 'Elevator (Main Third Floor)', 'building' => 'Main Building', 'floor' => 'Third Floor', 'type' => 'Facility', 'status' => 'Active'],
        ];
    }

    public function run(): void
    {
        DB::table('rooms')->delete();

        foreach ($this->rooms() as $room) {
            Room::create($room);
        }
    }
}
