<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\StudentTimeLog;
use App\Models\StudentViolation;
use App\Models\ViolationType;
use App\Models\VisitorRegistration;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class AdminDashboardController extends Controller
{
    public function index(Request $request): array
    {
        $days = $request->integer('days', 15);
        $days = in_array($days, [15, 30, 60, 90], true) ? $days : 15;

        $today = Carbon::today();
        $yesterday = Carbon::yesterday();
        $start = Carbon::today()->subDays($days - 1);

        $totalStudents = Student::count();

        $presentToday = StudentTimeLog::query()
            ->whereDate('time', $today)
            ->distinct()
            ->count('student_id');
        $presentYesterday = StudentTimeLog::query()
            ->whereDate('time', $yesterday)
            ->distinct()
            ->count('student_id');

        $pendingViolations = StudentViolation::query()
            ->where('status', '!=', StudentViolation::STATUS_RESOLVED)
            ->count();

        $violationsToday = StudentViolation::query()->whereDate('created_at', $today)->count();
        $violationsYesterday = StudentViolation::query()->whereDate('created_at', $yesterday)->count();

        $visitorsToday = VisitorRegistration::query()->whereDate('created_at', $today)->count();
        $visitorsYesterday = VisitorRegistration::query()->whereDate('created_at', $yesterday)->count();

        $totalViolations = StudentViolation::count();
        $resolvedViolations = StudentViolation::query()->where('status', StudentViolation::STATUS_RESOLVED)->count();
        $resolutionRate = $totalViolations > 0 ? round(($resolvedViolations / $totalViolations) * 100, 1) : 0;

        $checkins = StudentTimeLog::query()
            ->where('type', 'in')
            ->where('time', '>=', $start)
            ->selectRaw('DATE(time) as date, COUNT(*) as total')
            ->groupBy('date')
            ->pluck('total', 'date');

        $violations = StudentViolation::query()
            ->where('created_at', '>=', $start)
            ->selectRaw('DATE(created_at) as date, COUNT(*) as total')
            ->groupBy('date')
            ->pluck('total', 'date');

        $visitors = VisitorRegistration::query()
            ->where('created_at', '>=', $start)
            ->selectRaw('DATE(created_at) as date, COUNT(*) as total')
            ->groupBy('date')
            ->pluck('total', 'date');

        $series = [];
        for ($i = 0; $i < $days; $i++) {
            $date = $start->copy()->addDays($i);
            $key = $date->toDateString();
            $series[] = [
                'date' => $key,
                'label' => $date->format('M d'),
                'checkins' => (int) ($checkins[$key] ?? 0),
                'violations' => (int) ($violations[$key] ?? 0),
                'visitors' => (int) ($visitors[$key] ?? 0),
            ];
        }

        $typeNames = ViolationType::query()->pluck('name', 'id');
        $typeCounts = [];
        StudentViolation::query()->pluck('violation_type_ids')->each(function ($ids) use (&$typeCounts): void {
            foreach ($ids ?? [] as $id) {
                $typeCounts[$id] = ($typeCounts[$id] ?? 0) + 1;
            }
        });
        $totalTypeUsages = array_sum($typeCounts);
        $topViolationTypes = collect($typeCounts)
            ->map(fn (int $count, int $id): array => [
                'name' => $typeNames->get($id, "Type #{$id}"),
                'count' => $count,
                'pct' => $totalTypeUsages > 0 ? round(($count / $totalTypeUsages) * 100, 1) : 0,
            ])
            ->sortByDesc('count')
            ->take(5)
            ->values()
            ->all();

        $topOffenders = Student::query()
            ->withCount(['violations as pending_count' => fn ($query) => $query->where('status', '!=', StudentViolation::STATUS_RESOLVED)])
            ->orderByDesc('pending_count')
            ->limit(10)
            ->get()
            ->filter(fn (Student $student) => $student->pending_count > 0)
            ->take(5)
            ->values()
            ->map(fn (Student $student): array => [
                'id' => $student->id,
                'name' => $student->full_name,
                'id_number' => $student->id_number,
                'program_and_year' => $student->program_and_year,
                'count' => $student->pending_count,
                'pct' => $pendingViolations > 0 ? round(($student->pending_count / $pendingViolations) * 100, 1) : 0,
            ])
            ->all();

        return [
            'kpis' => [
                'total_students' => $totalStudents,
                'present_today' => $presentToday,
                'present_yesterday' => $presentYesterday,
                'violations_today' => $violationsToday,
                'violations_yesterday' => $violationsYesterday,
                'pending_violations' => $pendingViolations,
                'resolved_violations' => $resolvedViolations,
                'total_violations' => $totalViolations,
                'resolution_rate' => $resolutionRate,
                'visitors_today' => $visitorsToday,
                'visitors_yesterday' => $visitorsYesterday,
            ],
            'series' => $series,
            'top_violation_types' => $topViolationTypes,
            'top_offenders' => $topOffenders,
        ];
    }
}
