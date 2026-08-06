<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\StudentResource;
use App\Models\Student;
use App\Models\StudentTimeLog;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class StudentLogController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $students = Student::query()
            ->with('academicYear')
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

        $logs = $student->timeLogs()
            ->with('performedBy')
            ->when($request->date('date'), fn ($query, $date) => $query->whereDate('time', $date))
            ->get();

        $days = $logs
            ->groupBy(fn (StudentTimeLog $log) => $log->time->toDateString())
            ->map(function ($logs, string $date): array {
                return [
                    'date' => $date,
                    'total' => $logs->count(),
                    'logs' => $logs->map(fn (StudentTimeLog $log): array => [
                        'id' => $log->id,
                        'type' => $log->type,
                        'time' => $log->time,
                        'performed_by' => $log->performedBy !== null
                            ? ['id' => $log->performedBy->id, 'name' => $log->performedBy->name]
                            : null,
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
