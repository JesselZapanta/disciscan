<?php

namespace App\Http\Controllers\Api\Guard;

use App\Http\Controllers\Controller;
use App\Http\Requests\Guard\StoreStudentViolationRequest;
use App\Http\Resources\Admin\ViolationTypeResource;
use App\Http\Resources\StudentViolationResource;
use App\Models\AcademicYear;
use App\Models\Student;
use App\Models\StudentViolation;
use App\Models\ViolationType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Symfony\Component\HttpFoundation\Response;

class ViolationController extends Controller
{
    public function violationTypes(): AnonymousResourceCollection
    {
        $violationTypes = ViolationType::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return ViolationTypeResource::collection($violationTypes);
    }

    public function store(StoreStudentViolationRequest $request, Student $student): StudentViolationResource|JsonResponse
    {
        if (! $this->belongsToActiveYear($student)) {
            return response()->json(
                ['message' => 'Student does not belong to the active academic year.'],
                Response::HTTP_CONFLICT
            );
        }

        $violation = $student->violations()->create([
            'violation_type_ids' => $request->validated('violation_type_ids'),
            'remarks' => $request->validated('remarks'),
            'status' => StudentViolation::STATUS_NON_COMPLIANT,
            'recorded_by' => $request->user()->id,
        ]);
        $violation->load(['student', 'recordedBy']);

        return (new StudentViolationResource($violation))->response()->setStatusCode(Response::HTTP_CREATED);
    }

    private function belongsToActiveYear(Student $student): bool
    {
        $activeYear = AcademicYear::query()->where('status', 'active')->first();

        return $activeYear !== null && $student->academic_year_id === $activeYear->id;
    }
}
