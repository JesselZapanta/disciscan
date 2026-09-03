<?php

namespace Database\Seeders;

use App\Models\Student;
use App\Models\StudentTimeLog;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class StudentTimeLogSeeder extends Seeder
{
    use WithoutModelEvents;

    private const STUDENT_ID_FROM = 1;

    private const STUDENT_ID_TO = 5000;

    private const DATE_FROM = '2026-05-01';

    private const DATE_TO = '2026-08-31';

    /**
     * Seed time logs for all students with IDs 1 to 5000.
     *
     * Every student gets 1 to 3 in/out pairs on each weekday from May to July 2026.
     * Roughly one in four students also has logs on some Saturdays and Sundays.
     */
    public function run(): void
    {
        $students = Student::whereBetween('id', [self::STUDENT_ID_FROM, self::STUDENT_ID_TO])->get();

        if ($students->isEmpty()) {
            $this->command->warn('No students found in ID range '.self::STUDENT_ID_FROM.'-'.self::STUDENT_ID_TO.'; skipping student time log seeding.');

            return;
        }

        $start = Carbon::parse(self::DATE_FROM)->startOfDay();
        $end = Carbon::parse(self::DATE_TO)->endOfDay();

        StudentTimeLog::whereBetween('time', [$start, $end])->delete();

        $guardIds = User::where('role', 'guard')->pluck('id')->all();
        $rows = [];
        $created = 0;

        foreach ($students as $student) {
            $includesWeekends = random_int(1, 4) === 1;

            for ($date = $start->copy(); $date->lte($end); $date->addDay()) {
                $pairs = $this->pairsForDay($date, $includesWeekends);

                foreach ($pairs as [$in, $out]) {
                    $performedBy = $guardIds === [] ? null : $guardIds[array_rand($guardIds)];

                    $rows[] = [
                        'student_id' => $student->id,
                        'type' => 'in',
                        'time' => $in,
                        'performed_by' => $performedBy,
                        'academic_year_id' => $student->academic_year_id,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];

                    $rows[] = [
                        'student_id' => $student->id,
                        'type' => 'out',
                        'time' => $out,
                        'performed_by' => $performedBy,
                        'academic_year_id' => $student->academic_year_id,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];

                    $created += 2;

                    if (count($rows) >= 500) {
                        StudentTimeLog::insert($rows);
                        $rows = [];
                    }
                }
            }
        }

        if ($rows !== []) {
            StudentTimeLog::insert($rows);
        }

        $this->command->info("Seeded {$created} time logs for {$students->count()} students from ".self::DATE_FROM.' to '.self::DATE_TO.'.');
    }

    /**
     * Generate the in/out pairs for a given day.
     *
     * Weekdays always get 1 to 3 pairs. Weekend days are skipped entirely for
     * most students; for the remaining students each weekend day has a 40% chance
     * of producing 1 to 2 pairs within shorter hours.
     *
     * @return array<int, array{Carbon, Carbon}>
     */
    private function pairsForDay(Carbon $date, bool $includesWeekends): array
    {
        if ($date->isWeekday()) {
            return $this->logPairsForDay($date, [[7, 9], [10, 12], [13, 16]], 3);
        }

        if (! $includesWeekends || random_int(1, 100) > 40) {
            return [];
        }

        return $this->logPairsForDay($date, [[8, 11]], 2);
    }

    /**
     * Generate 1 to $maxPairs in/out pairs within the given hour windows.
     *
     * @param  array<int, array{int, int}>  $windows
     * @return array<int, array{Carbon, Carbon}>
     */
    private function logPairsForDay(Carbon $date, array $windows, int $maxPairs): array
    {
        $pairs = random_int(1, $maxPairs);
        $entries = [];
        $previousOut = null;

        foreach ($windows as [$startHour, $endHour]) {
            if (count($entries) >= $pairs) {
                break;
            }

            $earliest = $date->copy()->setTime($startHour, 0);
            $latest = $date->copy()->setTime($endHour, 0);

            if ($previousOut !== null && $previousOut->isAfter($earliest)) {
                $earliest = $previousOut->copy()->addMinutes(15);
            }

            if ($earliest->isAfter($latest)) {
                $earliest = $latest->copy()->subMinutes(30);
            }

            $in = $earliest->copy()->addMinutes(random_int(0, $earliest->diffInMinutes($latest)));
            $out = $in->copy()->addMinutes(random_int(60, 180));
            $previousOut = $out;

            $entries[] = [$in, $out];
        }

        return $entries;
    }
}
