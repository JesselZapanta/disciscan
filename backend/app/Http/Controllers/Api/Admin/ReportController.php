<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReportRequest;
use App\Models\AcademicYear;
use App\Models\Compliance;
use App\Models\Student;
use App\Models\StudentTimeLog;
use App\Models\StudentViolation;
use App\Models\User;
use App\Models\ViolationType;
use App\Models\VisitorRegistration;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class ReportController extends Controller
{
    private const TYPES = ['violations', 'attendance', 'visitors', 'compliance', 'summary'];

    private const STATUS_LABELS = [
        'violations' => ['All', 'Non-compliant', 'Resolved'],
        'compliance' => ['All', 'Non-Compliant', 'Resolved'],
        'visitors' => ['All', 'pending', 'checked_in', 'checked_out'],
    ];

    public function show(ReportRequest $request, string $type): JsonResponse
    {
        abort_unless(in_array($type, self::TYPES), 404);

        return response()->json($this->build($request, $type));
    }

    private function build(Request $request, string $type): array
    {
        return match ($type) {
            'violations' => $this->violations($request),
            'attendance' => $this->attendance($request),
            'visitors' => $this->visitors($request),
            'compliance' => $this->compliance($request),
            'summary' => $this->summary($request),
        };
    }

    private function filters(Request $request): array
    {
        $from = $request->date('from')?->startOfDay() ?? now()->subDays(30)->startOfDay();
        $to = $request->date('to')?->endOfDay() ?? now()->endOfDay();

        $labels = ['Period: '.$from->format('M d, Y').' - '.$to->format('M d, Y')];

        if ($request->filled('academic_year_id')) {
            $year = AcademicYear::find($request->integer('academic_year_id'));
            $labels[] = 'Academic Year: '.($year?->code ?? 'N/A');
        }

        if ($request->filled('status')) {
            $labels[] = 'Status: '.$request->input('status');
        }

        if ($request->filled('category')) {
            $category = ViolationType::find($request->integer('category'));
            $labels[] = 'Category: '.($category?->name ?? 'N/A');
        }

        return [
            'from' => $from,
            'to' => $to,
            'academic_year_id' => $request->integer('academic_year_id') ?: null,
            'status' => $request->input('status'),
            'category' => $request->integer('category') ?: null,
            'labels' => $labels,
        ];
    }

    private function violations(Request $request): array
    {
        $f = $this->filters($request);

        $query = StudentViolation::query()
            ->with(['student', 'recordedBy'])
            ->whereBetween('created_at', [$f['from'], $f['to']]);

        if ($f['academic_year_id']) {
            $query->whereHas('student', fn ($q) => $q->where('academic_year_id', $f['academic_year_id']));
        }
        if ($f['status'] && $f['status'] !== 'All') {
            $query->where('status', $f['status']);
        }
        if ($f['category']) {
            $query->whereJsonContains('violation_type_ids', $f['category']);
        }

        $violations = $query->latest()->limit(500)->get();
        $total = $violations->count();
        $resolved = $violations->where('status', StudentViolation::STATUS_RESOLVED)->count();
        $nonCompliant = $total - $resolved;

        $typeNames = ViolationType::pluck('name', 'id');
        $byType = collect();
        $violations->each(function (StudentViolation $v) use ($typeNames, $byType): void {
            foreach ($v->violation_type_ids ?? [] as $id) {
                $byType[$typeNames[$id] ?? "Type #{$id}"] = ($byType[$typeNames[$id] ?? "Type #{$id}"] ?? 0) + 1;
            }
        });

        $rows = $violations->map(fn (StudentViolation $v) => [
            $this->studentName($v->student),
            $v->student?->id_number ?? '—',
            $v->student?->program_and_year ?? '—',
            collect($v->violation_type_ids ?? [])
                ->map(fn ($id) => $typeNames[$id] ?? "Type #{$id}")->join(', '),
            $v->created_at->format('M d, Y'),
            $v->status,
            $v->recordedBy?->name ?? '—',
        ])->values();

        return $this->payload('Violations Report', 'discipline-violations-report', $f, [
            'kpis' => [
                ['label' => 'Total Violations', 'value' => $total],
                ['label' => 'Resolved', 'value' => $resolved],
                ['label' => 'Non-compliant', 'value' => $nonCompliant],
                ['label' => 'Resolution Rate', 'value' => $this->percent($resolved, $total)],
            ],
            'sections' => [
                [
                    'title' => 'Violations by Category',
                    'headers' => ['Category', 'Count', 'Share'],
                    'rows' => $byType
                        ->sortDesc()
                        ->take(15)
                        ->map(fn ($count, $name) => [$name, $count, $this->percent($count, max($total, 1), true)])
                        ->values()
                        ->all(),
                ],
                [
                    'title' => 'Violations by Program',
                    'headers' => ['Program / Year', 'Count'],
                    'rows' => $violations
                        ->groupBy(fn ($v) => $v->student?->program_and_year ?? 'Unknown')
                        ->map(fn (Collection $items, string $program) => [$program, $items->count()])
                        ->sortByDesc(fn (array $row) => $row[1])
                        ->values()
                        ->all(),
                ],
                [
                    'title' => 'Violation Records',
                    'headers' => ['Student', 'ID No.', 'Program / Year', 'Category', 'Date', 'Status', 'Recorded By'],
                    'rows' => $rows->all(),
                ],
            ],
        ]);
    }

    private function attendance(Request $request): array
    {
        $f = $this->filters($request);

        $base = StudentTimeLog::query()
            ->whereBetween('time', [$f['from'], $f['to']])
            ->when($f['academic_year_id'], fn ($q) => $q->where('academic_year_id', $f['academic_year_id']));

        $checkIns = (clone $base)->where('type', 'in')->count();
        $checkOuts = (clone $base)->where('type', 'out')->count();
        $studentsPresent = (clone $base)->distinct()->count('student_id');

        $byDay = (clone $base)
            ->selectRaw("DATE(time) as date, COUNT(CASE WHEN type = 'in' THEN 1 END) as ins, COUNT(CASE WHEN type = 'out' THEN 1 END) as outs")
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        $daily = collect();
        for ($day = $f['from']->copy(); $day->lte($f['to']); $day->addDay()) {
            $key = $day->format('Y-m-d');
            $row = $byDay->get($key);
            $daily->push([
                'date' => $key,
                'label' => $day->format('M d'),
                'ins' => (int) ($row->ins ?? 0),
                'outs' => (int) ($row->outs ?? 0),
            ]);
        }

        return $this->payload('Attendance Report', 'student-attendance-report', $f, [
            'kpis' => [
                ['label' => 'Total Check-ins', 'value' => $checkIns],
                ['label' => 'Total Check-outs', 'value' => $checkOuts],
                ['label' => 'Active Days', 'value' => $daily->filter(fn ($d) => $d['ins'] > 0)->count()],
                ['label' => 'Students Present', 'value' => $studentsPresent],
            ],
            'chart' => [
                'title' => 'Daily Attendance',
                'points' => $daily->map(fn ($d) => ['label' => $d['label'], 'ins' => $d['ins'], 'outs' => $d['outs']])->values()->all(),
            ],
            'sections' => [
                [
                    'title' => 'Daily Attendance',
                    'headers' => ['Date', 'Check-ins', 'Check-outs'],
                    'rows' => $daily->map(fn ($d) => [$d['label'], $d['ins'], $d['outs']])->all(),
                ],
            ],
        ]);
    }

    private function visitors(Request $request): array
    {
        $f = $this->filters($request);

        $query = VisitorRegistration::query()
            ->with('timeLogs')
            ->whereDate('visit_date', '>=', $f['from']->toDateString())
            ->whereDate('visit_date', '<=', $f['to']->toDateString());

        if ($f['status'] && $f['status'] !== 'All') {
            $query->where('status', $f['status']);
        }

        $visitors = $query->latest()->limit(500)->get();
        $total = $visitors->count();

        $byPurpose = $visitors->groupBy(fn ($v) => $v->purpose === 'Other' && $v->purpose_other ? $v->purpose_other : $v->purpose)
            ->map(fn (Collection $items, string $purpose) => [$purpose ?: 'Unspecified', $items->count()])
            ->sortByDesc(fn (array $row) => $row[1])
            ->values();

        $byDay = $visitors->groupBy(fn ($v) => Carbon::parse($v->visit_date)->format('Y-m-d'));

        $daily = collect();
        for ($day = $f['from']->copy(); $day->lte($f['to']); $day->addDay()) {
            $key = $day->format('Y-m-d');
            $daily->push([
                'date' => $key,
                'label' => $day->format('M d'),
                'count' => $byDay->get($key)?->count() ?? 0,
            ]);
        }

        $rows = $visitors->map(function (VisitorRegistration $v) {
            $in = $v->timeLogs->firstWhere('type', 'in');
            $out = $v->timeLogs->firstWhere('type', 'out');

            return [
                '#'.$v->id,
                $v->fullname,
                $v->contact,
                $v->purpose === 'Other' && $v->purpose_other ? $v->purpose_other : $v->purpose,
                $v->person_office_to_visit,
                Carbon::parse($v->visit_date)->format('M d, Y'),
                $in?->time ? Carbon::parse($in->time)->format('h:i A') : '—',
                $out?->time ? Carbon::parse($out->time)->format('h:i A') : '—',
                $v->status,
            ];
        })->values();

        return $this->payload('Visitor Log Report', 'visitor-log-report', $f, [
            'kpis' => [
                ['label' => 'Total Visitors', 'value' => $total],
                ['label' => 'Pending', 'value' => $visitors->where('status', 'pending')->count()],
                ['label' => 'Checked In', 'value' => $visitors->where('status', 'checked_in')->count()],
                ['label' => 'Checked Out', 'value' => $visitors->where('status', 'checked_out')->count()],
            ],
            'sections' => [
                [
                    'title' => 'Visitors by Purpose',
                    'headers' => ['Purpose', 'Count'],
                    'rows' => $byPurpose->all(),
                ],
                [
                    'title' => 'Daily Visitor Traffic',
                    'headers' => ['Date', 'Visitors'],
                    'rows' => $daily->map(fn ($d) => [$d['label'], $d['count']])->all(),
                ],
                [
                    'title' => 'Visitor Records',
                    'headers' => ['Record', 'Name', 'Contact', 'Purpose', 'Person / Office', 'Visit Date', 'In', 'Out', 'Status'],
                    'rows' => $rows->all(),
                ],
            ],
        ]);
    }

    private function compliance(Request $request): array
    {
        $f = $this->filters($request);

        $query = Compliance::query()
            ->with('room')
            ->whereBetween('created_at', [$f['from'], $f['to']]);

        if ($f['status'] && $f['status'] !== 'All') {
            $query->where('status', $f['status']);
        }

        $inspections = $query->latest()->limit(500)->get();
        $total = $inspections->count();
        $resolved = $inspections->where('status', 'Resolved')->count();
        $nonCompliant = $total - $resolved;

        $issueCounts = collect();
        $inspections->each(function (Compliance $c) use ($issueCounts): void {
            foreach (preg_split('/[\n,;]+/', (string) $c->issues) as $issue) {
                $issue = trim($issue);
                if ($issue !== '') {
                    $issueCounts[$issue] = ($issueCounts[$issue] ?? 0) + 1;
                }
            }
        });

        $byRoom = $inspections->groupBy(fn ($c) => $c->room?->room_name ?? 'Unknown')
            ->map(fn (Collection $items, string $room) => [$room, $items->count()])
            ->sortByDesc(fn (array $row) => $row[1])
            ->values();

        $rows = $inspections->map(fn (Compliance $c) => [
            $c->created_at->format('M d, Y'),
            $c->room?->room_name ?? '—',
            $c->room?->building ?? '—',
            $c->issues ?: '—',
            $c->status,
            $c->recorded_by ?: '—',
        ])->values();

        return $this->payload('Compliance Report', 'facility-compliance-report', $f, [
            'kpis' => [
                ['label' => 'Total Inspections', 'value' => $total],
                ['label' => 'Compliant', 'value' => $resolved],
                ['label' => 'Non-compliant', 'value' => $nonCompliant],
                ['label' => 'Compliance Rate', 'value' => $this->percent($resolved, $total)],
            ],
            'sections' => [
                [
                    'title' => 'Inspections by Room',
                    'headers' => ['Room', 'Inspections'],
                    'rows' => $byRoom->all(),
                ],
                [
                    'title' => 'Issues Found',
                    'headers' => ['Issue', 'Occurrences'],
                    'rows' => $issueCounts->sortDesc()->take(15)->map(fn ($count, $issue) => [$issue, $count])->values()->all(),
                ],
                [
                    'title' => 'Inspection Records',
                    'headers' => ['Date', 'Room', 'Building', 'Issues', 'Status', 'Recorded By'],
                    'rows' => $rows->all(),
                ],
            ],
        ]);
    }

    private function summary(Request $request): array
    {
        $f = $this->filters($request);

        $students = Student::query()
            ->when($f['academic_year_id'], fn ($q) => $q->where('academic_year_id', $f['academic_year_id']))
            ->count();

        $violations = StudentViolation::whereBetween('created_at', [$f['from'], $f['to']]);
        $visitors = VisitorRegistration::whereBetween('created_at', [$f['from'], $f['to']]);

        if ($f['academic_year_id']) {
            $violations->whereHas('student', fn ($q) => $q->where('academic_year_id', $f['academic_year_id']));
        }

        $totalViolations = $violations->count();
        $resolved = StudentViolation::whereBetween('created_at', [$f['from'], $f['to']])
            ->when($f['academic_year_id'], fn ($q) => $q->whereHas('student', fn ($sq) => $sq->where('academic_year_id', $f['academic_year_id'])))
            ->where('status', StudentViolation::STATUS_RESOLVED)
            ->count();

        $checkIns = StudentTimeLog::whereBetween('time', [$f['from'], $f['to']])
            ->when($f['academic_year_id'], fn ($q) => $q->where('academic_year_id', $f['academic_year_id']))
            ->where('type', 'in')
            ->count();

        $visitorTotal = $visitors->count();

        $typeNames = ViolationType::pluck('name', 'id');
        $topTypes = StudentViolation::whereBetween('created_at', [$f['from'], $f['to']])
            ->when($f['academic_year_id'], fn ($q) => $q->whereHas('student', fn ($sq) => $sq->where('academic_year_id', $f['academic_year_id'])))
            ->get(['violation_type_ids'])
            ->flatMap(fn ($v) => $v->violation_type_ids ?? [])
            ->countBy()
            ->sortDesc()
            ->take(5)
            ->map(function (int $count, int $id) use ($typeNames, $totalViolations) {
                return ['name' => $typeNames[$id] ?? "Type #{$id}", 'count' => $count, 'pct' => $this->percent($count, max($totalViolations, 1), true)];
            })
            ->values();

        $topOffenders = StudentViolation::whereBetween('created_at', [$f['from'], $f['to']])
            ->when($f['academic_year_id'], fn ($q) => $q->whereHas('student', fn ($sq) => $sq->where('academic_year_id', $f['academic_year_id'])))
            ->with('student')
            ->get()
            ->groupBy('student_id')
            ->map(function (Collection $items) {
                $student = $items->first()->student;

                return [
                    $this->studentName($student),
                    $student?->id_number ?? '—',
                    $student?->program_and_year ?? '—',
                    $items->count(),
                ];
            })
            ->sortByDesc(fn (array $row) => $row[3])
            ->take(5)
            ->values();

        $daily = $this->dailySeries($f);

        return $this->payload('Executive Summary Report', 'executive-summary-report', $f, [
            'kpis' => [
                ['label' => 'Enrolled Students', 'value' => $students],
                ['label' => 'Check-ins', 'value' => $checkIns],
                ['label' => 'Violations', 'value' => $totalViolations],
                ['label' => 'Resolution Rate', 'value' => $this->percent($resolved, $totalViolations)],
                ['label' => 'Visitors', 'value' => $visitorTotal],
            ],
            'sections' => [
                [
                    'title' => 'Top Violation Categories',
                    'headers' => ['Category', 'Count', 'Share'],
                    'rows' => $topTypes->map(fn ($t) => [$t['name'], $t['count'], $t['pct']])->all(),
                ],
                [
                    'title' => 'Top Offenders',
                    'headers' => ['Student', 'ID No.', 'Program / Year', 'Violations'],
                    'rows' => $topOffenders->all(),
                ],
                [
                    'title' => 'Daily Activity',
                    'headers' => ['Date', 'Check-ins', 'Violations', 'Visitors'],
                    'rows' => $daily->map(fn ($d) => [$d['label'], $d['checkins'], $d['violations'], $d['visitors']])->all(),
                ],
            ],
        ]);
    }

    private function dailySeries(array $f): Collection
    {
        $checkins = StudentTimeLog::selectRaw('DATE(time) as date, COUNT(*) as total')
            ->where('type', 'in')
            ->whereBetween('time', [$f['from'], $f['to']])
            ->when($f['academic_year_id'], fn ($q) => $q->where('academic_year_id', $f['academic_year_id']))
            ->groupBy('date')->pluck('total', 'date');

        $violations = StudentViolation::selectRaw('DATE(created_at) as date, COUNT(*) as total')
            ->whereBetween('created_at', [$f['from'], $f['to']])
            ->when($f['academic_year_id'], fn ($q) => $q->whereHas('student', fn ($sq) => $sq->where('academic_year_id', $f['academic_year_id'])))
            ->groupBy('date')->pluck('total', 'date');

        $visitors = VisitorRegistration::selectRaw('DATE(created_at) as date, COUNT(*) as total')
            ->whereBetween('created_at', [$f['from'], $f['to']])
            ->groupBy('date')->pluck('total', 'date');

        $daily = collect();
        for ($day = $f['from']->copy(); $day->lte($f['to']); $day->addDay()) {
            $key = $day->format('Y-m-d');
            $daily->push([
                'date' => $key,
                'label' => $day->format('M d'),
                'checkins' => (int) ($checkins[$key] ?? 0),
                'violations' => (int) ($violations[$key] ?? 0),
                'visitors' => (int) ($visitors[$key] ?? 0),
            ]);
        }

        return $daily;
    }

    private function payload(string $title, string $slug, array $f, array $content): array
    {
        return array_merge([
            'meta' => [
                'title' => $title,
                'generated_at' => now()->format('M d, Y h:i A'),
                'generated_by' => auth()->user() instanceof User ? auth()->user()->name : '',
                'filters' => $f['labels'],
            ],
            'filename' => $slug.'-'.now()->format('Y-m-d').'.pdf',
        ], $content);
    }

    private function percent(int $part, int $total, bool $suffix = false): string
    {
        $value = $total > 0 ? round($part / $total * 100, 1) : 0;

        return $suffix ? $value.'%' : $value;
    }

    private function studentName(?Student $student): string
    {
        if (! $student) {
            return '—';
        }

        return collect([$student->firstname, $student->middlename, $student->lastname, $student->extension])
            ->filter()
            ->join(' ');
    }
}
