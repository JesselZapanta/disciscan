<?php

namespace App\Http\Controllers\Api\Guard;

use App\Http\Controllers\Controller;
use App\Models\StudentTimeLog;
use App\Models\StudentViolation;
use App\Models\ViolationType;
use App\Models\VisitorRegistration;
use App\Models\VisitorTimeLog;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class GuardDashboardController extends Controller
{
    public function index(Request $request): array
    {
        $days = $request->integer('days', 15);
        $days = in_array($days, [15, 30, 60, 90], true) ? $days : 15;

        $today = Carbon::today();
        $yesterday = Carbon::yesterday();
        $start = Carbon::today()->subDays($days - 1);

        $scansToday = StudentTimeLog::query()->whereDate('time', $today)->count();
        $scansYesterday = StudentTimeLog::query()->whereDate('time', $yesterday)->count();

        $visitorsToday = VisitorRegistration::query()->whereDate('created_at', $today)->count();
        $visitorsYesterday = VisitorRegistration::query()->whereDate('created_at', $yesterday)->count();

        $violationsToday = StudentViolation::query()->whereDate('created_at', $today)->count();
        $violationsYesterday = StudentViolation::query()->whereDate('created_at', $yesterday)->count();

        $pendingViolations = StudentViolation::query()
            ->where('status', '!=', StudentViolation::STATUS_RESOLVED)
            ->count();
        $resolvedViolations = StudentViolation::query()->where('status', StudentViolation::STATUS_RESOLVED)->count();
        $totalViolations = StudentViolation::count();
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

        $studentScans = StudentTimeLog::query()
            ->with(['student', 'performedBy'])
            ->latest('time')
            ->limit(5)
            ->get()
            ->map(fn (StudentTimeLog $log): array => [
                'time' => $log->time?->toIso8601String(),
                'name' => $log->student?->full_name ?? 'Unknown student',
                'id' => $log->student?->id_number,
                'type' => $log->type === 'in' ? 'Time-in recorded' : 'Time-out recorded',
                'logged_by' => $log->performedBy?->name,
                'status' => 'Cleared',
            ]);

        $visitorScans = VisitorTimeLog::query()
            ->with(['visitorRegistration', 'performedBy'])
            ->latest('time')
            ->limit(5)
            ->get()
            ->map(fn (VisitorTimeLog $log): array => [
                'time' => $log->time?->toIso8601String(),
                'name' => 'Visitor — '.($log->visitorRegistration?->fullname ?? 'Unknown'),
                'id' => $log->visitorRegistration ? 'VIS-'.str_pad((string) $log->visitorRegistration->id, 5, '0', STR_PAD_LEFT) : '—',
                'type' => $log->type === 'in' ? 'Visitor entry logged' : 'Visitor exit logged',
                'logged_by' => $log->performedBy?->name,
                'status' => 'Logged',
            ]);

        $violationScans = StudentViolation::query()
            ->with(['student', 'recordedBy'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(function (StudentViolation $violation) use ($typeNames): array {
                $names = collect($violation->violation_type_ids ?? [])
                    ->map(fn (int $id): ?string => $typeNames->get($id))
                    ->filter()
                    ->values()
                    ->all();

                return [
                    'time' => $violation->created_at?->toIso8601String(),
                    'name' => $violation->student?->full_name ?? 'Unknown student',
                    'id' => $violation->student?->id_number,
                    'type' => implode(', ', $names) ?: 'Violation recorded',
                    'logged_by' => $violation->recordedBy?->name,
                    'status' => $violation->status,
                ];
            });

        $recentScans = collect()
            ->merge($studentScans)
            ->merge($visitorScans)
            ->merge($violationScans)
            ->sortByDesc('time')
            ->take(8)
            ->values()
            ->all();

        return [
            'kpis' => [
                'scans_today' => $scansToday,
                'scans_yesterday' => $scansYesterday,
                'visitors_today' => $visitorsToday,
                'visitors_yesterday' => $visitorsYesterday,
                'violations_today' => $violationsToday,
                'violations_yesterday' => $violationsYesterday,
                'pending_violations' => $pendingViolations,
                'resolved_violations' => $resolvedViolations,
                'total_violations' => $totalViolations,
                'resolution_rate' => $resolutionRate,
            ],
            'series' => $series,
            'recent_scans' => $recentScans,
        ];
    }
}
