<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreAcademicYearRequest;
use App\Http\Requests\Admin\UpdateAcademicYearRequest;
use App\Http\Resources\Admin\AcademicYearResource;
use App\Models\AcademicYear;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Symfony\Component\HttpFoundation\Response;

class AcademicYearController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $academicYears = AcademicYear::query()
            ->when($request->filled('search'), function ($query) use ($request): void {
                $search = trim($request->input('search'));
                $query->where(function ($query) use ($search): void {
                    $query->where('code', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->when(
                $request->filled('status') && in_array($request->input('status'), StoreAcademicYearRequest::STATUSES, true),
                fn ($query) => $query->where('status', $request->input('status'))
            )
            ->orderBy('id', $request->input('sort_dir', 'desc') === 'asc' ? 'asc' : 'desc')
            ->paginate($request->integer('per_page', 10));

        return AcademicYearResource::collection($academicYears);
    }

    public function store(StoreAcademicYearRequest $request): AcademicYearResource|JsonResponse
    {
        $data = $request->validated();
        $data['status'] ??= 'inactive';

        $academicYear = AcademicYear::create($data);

        $this->demoteOtherActiveAcademicYears($academicYear);

        return (new AcademicYearResource($academicYear))->response()->setStatusCode(Response::HTTP_CREATED);
    }

    public function update(UpdateAcademicYearRequest $request, AcademicYear $academicYear): AcademicYearResource|JsonResponse
    {
        if ($this->isLastActiveAndBeingDeactivated($request, $academicYear)) {
            return response()->json([
                'message' => 'At least one academic year must remain active.',
                'errors' => ['status' => ['The active academic year cannot be deactivated.']],
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $academicYear->update($request->validated());

        $this->demoteOtherActiveAcademicYears($academicYear);

        return new AcademicYearResource($academicYear);
    }

    public function destroy(Request $request, AcademicYear $academicYear): JsonResponse
    {
        if ($academicYear->status === 'active' && AcademicYear::where('status', 'active')->count() === 1) {
            return response()->json([
                'message' => 'The active academic year cannot be deleted.',
                'errors' => ['status' => ['The active academic year cannot be deleted.']],
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if (Student::where('academic_year_id', $academicYear->id)->exists()) {
            return response()->json([
                'message' => 'This academic year has enrolled students and cannot be deleted.',
                'errors' => ['status' => ['This academic year has enrolled students and cannot be deleted.']],
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $academicYear->delete();

        return response()->json(['message' => 'Academic year deleted.']);
    }

    private function isLastActiveAndBeingDeactivated(Request $request, AcademicYear $academicYear): bool
    {
        return $request->validated('status') === 'inactive'
            && $academicYear->status === 'active'
            && AcademicYear::where('status', 'active')->whereKeyNot($academicYear->id)->doesntExist();
    }

    private function demoteOtherActiveAcademicYears(AcademicYear $academicYear): void
    {
        if ($academicYear->status === 'active') {
            AcademicYear::whereKeyNot($academicYear->id)
                ->where('status', 'active')
                ->update(['status' => 'inactive']);
        }
    }
}
