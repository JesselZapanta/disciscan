<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\StudentResource;
use App\Models\Student;
use App\Models\StudentViolation;
use App\Models\ViolationType;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class StudentViolationController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $students = Student::query()
            ->with('academicYear')
            ->whereHas('violations', fn ($query) => $query->where('status', StudentViolation::STATUS_NON_COMPLIANT))
            ->when($request->filled('search'), function ($query) use ($request): void {
                $search = trim($request->input('search'));
                $query->where(function ($query) use ($search): void {
                    $query->where('id_number', 'like', "%{$search}%")
                        ->orWhere('firstname', 'like', "%{$search}%")
                        ->orWhere('middlename', 'like', "%{$search}%")
                        ->orWhere('lastname', 'like', "%{$search}%")
                        ->orWhere('extension', 'like', "%{$search}%")
                        ->orWhere('contact_no', 'like', "%{$search}%")
                        ->orWhere('program_and_year', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('academic_year_id'), fn ($query) => $query->where('academic_year_id', $request->integer('academic_year_id')))
            ->orderBy('id', $request->input('sort_dir', 'desc') === 'asc' ? 'asc' : 'desc')
            ->paginate($request->integer('per_page', 10));

        return StudentResource::collection($students);
    }

    public function show(Request $request, Student $student): array
    {
        $student->load('academicYear');

        $violations = $student->violations()
            ->with('recordedBy')
            ->when($request->date('date'), fn ($query, $date) => $query->whereDate('created_at', $date))
            ->get();

        $typeNamesById = ViolationType::query()
            ->whereIn('id', $violations->flatMap(fn (StudentViolation $violation): array => $violation->violation_type_ids ?? []))
            ->pluck('name', 'id');

        $days = $violations
            ->groupBy(fn (StudentViolation $violation) => $violation->created_at->toDateString())
            ->map(function ($items, string $date) use ($typeNamesById): array {
                return [
                    'date' => $date,
                    'total' => $items->count(),
                    'violations' => $items->map(fn (StudentViolation $violation): array => [
                        'id' => $violation->id,
                        'violation_types' => collect($violation->violation_type_ids ?? [])
                            ->map(fn (int $id): ?string => $typeNamesById->get($id))
                            ->filter()
                            ->values()
                            ->all(),
                        'remarks' => $violation->remarks,
                        'status' => $violation->status,
                        'recorded_by' => $violation->recordedBy !== null
                            ? ['id' => $violation->recordedBy->id, 'name' => $violation->recordedBy->name]
                            : null,
                        'created_at' => $violation->created_at?->toIso8601String(),
                    ])->values(),
                ];
            })
            ->values();

        return [
            'student' => new StudentResource($student),
            'days' => $days,
        ];
    }
}
