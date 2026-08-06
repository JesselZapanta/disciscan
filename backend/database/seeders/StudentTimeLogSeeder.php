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

    private const STUDENT_ID = 10000;

    private const DATE_FROM = '2026-05-01';

    private const DATE_TO = '2026-07-31';

    /**
     * Seed time logs for student 10000 on every weekday from May to July 2026.
     */
    public function run(): void
    {
        $student = Student::find(self::STUDENT_ID);

        if ($student === null) {
            $this->command->warn('Student '.self::STUDENT_ID.' not found; skipping student time log seeding.');

            return;
        }

        $start = Carbon::parse(self::DATE_FROM)->startOfDay();
        $end = Carbon::parse(self::DATE_TO)->endOfDay();

        StudentTimeLog::where('student_id', $student->id)
            ->whereBetween('time', [$start, $end])
            ->delete();

        $guardIds = User::where('role', 'guard')->pluck('id')->all();
        $created = 0;

        for ($date = $start->copy(); $date->lte($end); $date->addDay()) {
            if ($date->isWeekend()) {
                continue;
            }

            foreach ($this->logPairsForDay($date) as [$in, $out]) {
                $performedBy = $guardIds === [] ? null : $guardIds[array_rand($guardIds)];

                StudentTimeLog::create([
                    'student_id' => $student->id,
                    'type' => 'in',
                    'time' => $in,
                    'performed_by' => $performedBy,
                    'academic_year_id' => $student->academic_year_id,
                ]);

                StudentTimeLog::create([
                    'student_id' => $student->id,
                    'type' => 'out',
                    'time' => $out,
                    'performed_by' => $performedBy,
                    'academic_year_id' => $student->academic_year_id,
                ]);

                $created += 2;
            }
        }

        $this->command->info("Seeded {$created} time logs for student {$student->id} from ".self::DATE_FROM.' to '.self::DATE_TO.'.');
    }

    /**
     * Generate 1 to 3 in/out pairs within school hours for a given day.
     *
     * @return array<int, array{Carbon, Carbon}>
     */
    private function logPairsForDay(Carbon $date): array
    {
        $pairs = random_int(1, 3);
        $entries = [];
        $previousOut = null;

        foreach ([[7, 9], [10, 12], [13, 16]] as [$startHour, $endHour]) {
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
