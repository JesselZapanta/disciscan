<?php

namespace Database\Seeders;

use App\Models\Room;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RoomSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the default rooms.
     *
     * @return array<int, array{room_name: string, building: string, floor: string, type: string, status: string}>
     */
    private function rooms(): array
    {
        $buildingFloor = [
            ['building' => 'Main Building', 'prefix' => 'MB'],
            ['building' => 'Asenso Building', 'prefix' => 'AS'],
            ['building' => 'Annex Building', 'prefix' => 'AN'],
        ];

        $rooms = [];

        // Generate numbered rooms per building and floor.
        foreach ($buildingFloor as $building) {
            foreach ([1, 2, 3] as $floor) {
                $floorLabel = match ($floor) {
                    2 => '2nd',
                    3 => '3rd',
                    default => '1st',
                };

                $designations = match ($floor) {
                    1 => ['101', '102', '103', '104', '105'],
                    2 => ['201', '202', '203', '204', '205', '212'],
                    3 => ['301', '302', '303', '304'],
                    default => [],
                };

                $typesByDesignation = [
                    '101' => 'Lecture Room',
                    '102' => 'Lecture Room',
                    '103' => 'Laboratory',
                    '104' => 'Office',
                    '105' => 'Office',
                    '201' => 'Lecture Room',
                    '202' => 'Lecture Room',
                    '203' => 'Laboratory',
                    '204' => 'Laboratory',
                    '205' => 'Office',
                    '212' => 'Lecture Room',
                    '301' => 'Lecture Room',
                    '302' => 'Laboratory',
                    '303' => 'Office',
                    '304' => 'Laboratory',
                ];

                foreach ($designations as $designation) {
                    $rooms[] = [
                        'room_name' => $building['prefix'].'-'.$designation,
                        'building' => $building['building'],
                        'floor' => $floorLabel,
                        'type' => $typesByDesignation[$designation] ?? 'Lecture Room',
                        'status' => fake()->randomElement(['Active', 'Active', 'Active', 'Inactive']),
                    ];
                }
            }
        }

        $rooms[] = ['room_name' => 'Computer Laboratory 1', 'building' => 'Main Building', 'floor' => '2nd', 'type' => 'Laboratory', 'status' => 'Active'];
        $rooms[] = ['room_name' => 'Computer Laboratory 2', 'building' => 'Asenso Building', 'floor' => '3rd', 'type' => 'Laboratory', 'status' => 'Active'];
        $rooms[] = ['room_name' => 'Computer Laboratory 3', 'building' => 'Annex Building', 'floor' => '2nd', 'type' => 'Laboratory', 'status' => 'Active'];
        $rooms[] = ['room_name' => 'Faculty Office', 'building' => 'Main Building', 'floor' => '1st', 'type' => 'Office', 'status' => 'Active'];
        $rooms[] = ['room_name' => 'Registrar Office', 'building' => 'Asenso Building', 'floor' => '1st', 'type' => 'Office', 'status' => 'Active'];
        $rooms[] = ['room_name' => 'Guidance Office', 'building' => 'Annex Building', 'floor' => '1st', 'type' => 'Office', 'status' => 'Active'];
        $rooms[] = ['room_name' => 'Multipurpose Room', 'building' => 'Main Building', 'floor' => '1st', 'type' => 'Lecture Room', 'status' => 'Active'];

        return $rooms;
    }

    /**
     * Seed the default rooms.
     */
    public function run(): void
    {
        foreach ($this->rooms() as $room) {
            Room::updateOrCreate(
                ['room_name' => $room['room_name'], 'building' => $room['building']],
                $room
            );
        }
    }
}
