<?php

namespace App\Http\Controllers\Api\Guard;

use App\Http\Controllers\Controller;
use App\Http\Resources\StudentScanResource;
use App\Models\AcademicYear;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class StudentScanController extends Controller
{
    private const OPERATOR_SELECT = ['id', 'name'];

    public function lookup(string $idNumber): StudentScanResource|JsonResponse
    {
        $idNumber = trim($idNumber);

        if ($idNumber === '') {
            return response()->json(['message' => 'Invalid student ID number.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $activeYear = $this->activeYear();

        if ($activeYear === null) {
            return response()->json(['message' => 'No active academic year is set.'], Response::HTTP_NOT_FOUND);
        }

        $student = Student::query()
            ->with(['academicYear', 'timeLogs.performedBy:'.implode(',', self::OPERATOR_SELECT)])
            ->where('id_number', $idNumber)
            ->where('academic_year_id', $activeYear->id)
            ->first();

        if ($student === null) {
            return response()->json(
                ['message' => 'Student not found for the active academic year.'],
                Response::HTTP_NOT_FOUND
            );
        }

        return new StudentScanResource($student);
    }

    public function checkIn(Request $request, Student $student): StudentScanResource|JsonResponse
    {
        if (! $this->belongsToActiveYear($student)) {
            return response()->json(
                ['message' => 'Student does not belong to the active academic year.'],
                Response::HTTP_CONFLICT
            );
        }

        if ($this->latestType($student) === 'in') {
            return response()->json(['message' => 'Student is already checked in.'], Response::HTTP_CONFLICT);
        }

        $student->timeLogs()->create([
            'type' => 'in',
            'time' => now(),
            'performed_by' => $request->user()->id,
            'academic_year_id' => $student->academic_year_id,
        ]);
        $student->load(['academicYear', 'timeLogs.performedBy:'.implode(',', self::OPERATOR_SELECT)]);

        return new StudentScanResource($student);
    }

    public function checkOut(Request $request, Student $student): StudentScanResource|JsonResponse
    {
        if (! $this->belongsToActiveYear($student)) {
            return response()->json(
                ['message' => 'Student does not belong to the active academic year.'],
                Response::HTTP_CONFLICT
            );
        }

        if ($this->latestType($student) !== 'in') {
            return response()->json(['message' => 'Student must be checked in before checking out.'], Response::HTTP_CONFLICT);
        }

        $student->timeLogs()->create([
            'type' => 'out',
            'time' => now(),
            'performed_by' => $request->user()->id,
            'academic_year_id' => $student->academic_year_id,
        ]);
        $student->load(['academicYear', 'timeLogs.performedBy:'.implode(',', self::OPERATOR_SELECT)]);

        return new StudentScanResource($student);
    }

    private function belongsToActiveYear(Student $student): bool
    {
        $activeYear = $this->activeYear();

        return $activeYear !== null && $student->academic_year_id === $activeYear->id;
    }

    private function activeYear(): ?AcademicYear
    {
        return AcademicYear::query()->where('status', 'active')->first();
    }

    private function latestType(Student $student): ?string
    {
        return $student->timeLogs()->orderByDesc('time')->orderByDesc('id')->value('type');
    }
}
