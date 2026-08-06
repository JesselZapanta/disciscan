<?php

namespace Database\Seeders;

use App\Models\Student;
use App\Models\StudentViolation;
use App\Models\User;
use App\Models\ViolationType;
use Carbon\Carbon;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class StudentViolationSeeder extends Seeder
{
    use WithoutModelEvents;

    private const STUDENT_COUNT = 500;

    private const DATE_FROM = '2026-05-01';

    private const DATE_TO = '2026-07-31';

    /**
     * Seed 1 violation per day, 2 to 3 days per month, for 500 random students from May to July 2026.
     */
    public function run(): void
    {
        $studentIds = Student::inRandomOrder()->limit(self::STUDENT_COUNT)->pluck('id')->all();

        if ($studentIds === []) {
            $this->command->warn('No students found; skipping student violation seeding.');

            return;
        }

        $start = Carbon::parse(self::DATE_FROM)->startOfDay();
        $end = Carbon::parse(self::DATE_TO)->endOfDay();

        StudentViolation::whereBetween('created_at', [$start, $end])->delete();

        $guardIds = User::where('role', 'guard')->pluck('id')->all();
        $typeIds = ViolationType::query()->pluck('id')->all();
        $now = now();
        $rows = [];

        foreach ($studentIds as $studentId) {
            foreach ($this->datesForEachMonth($start, $end) as $date) {
                $time = $date->copy()->setTime(random_int(6, 17), random_int(0, 59));

                $rows[] = [
                    'student_id' => $studentId,
                    'violation_type_ids' => json_encode([$typeIds[array_rand($typeIds)]]),
                    'remarks' => fake()->optional(0.6)->sentence(),
                    'status' => StudentViolation::STATUS_NON_COMPLIANT,
                    'recorded_by' => $guardIds === [] ? null : $guardIds[array_rand($guardIds)],
                    'created_at' => $time,
                    'updated_at' => $now,
                ];
            }
        }

        foreach (array_chunk($rows, 500) as $chunk) {
            StudentViolation::insert($chunk);
        }

        $this->command->info('Seeded '.count($rows).' violations for '.count($studentIds).' random students from '.self::DATE_FROM.' to '.self::DATE_TO.'.');
    }

    /**
     * Generate 2 to 3 random weekdays per month within the given range.
     *
     * @return array<int, Carbon>
     */
    private function datesForEachMonth(Carbon $start, Carbon $end): array
    {
        $dates = [];

        for ($month = $start->copy()->startOfMonth(); $month->lte($end); $month->addMonth()) {
            $weekdays = collect(range(1, $month->daysInMonth))
                ->map(fn (int $day): Carbon => $month->copy()->day($day))
                ->filter(fn (Carbon $day): bool => $day->isWeekday())
                ->filter(fn (Carbon $day): bool => $day->between($start, $end))
                ->values();

            if ($weekdays->isEmpty()) {
                continue;
            }

            $take = min(random_int(2, 3), $weekdays->count());
            $keys = array_rand($weekdays->all(), $take);

            foreach ((array) $keys as $key) {
                $dates[] = $weekdays->get($key);
            }
        }

        return $dates;
    }
}
