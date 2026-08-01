<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreViolationTypeRequest;
use App\Http\Requests\Admin\UpdateViolationTypeRequest;
use App\Http\Resources\Admin\ViolationTypeResource;
use App\Models\ViolationType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Symfony\Component\HttpFoundation\Response;

class ViolationTypeController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $violationTypes = ViolationType::query()
            ->when($request->filled('search'), function ($query) use ($request): void {
                $search = trim($request->input('search'));
                $query->where(function ($query) use ($search): void {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->when(
                $request->filled('status') && in_array($request->input('status'), ['active', 'inactive'], true),
                fn ($query) => $query->where('is_active', $request->input('status') === 'active')
            )
            ->orderBy('id', $request->input('sort_dir', 'desc') === 'asc' ? 'asc' : 'desc')
            ->paginate($request->integer('per_page', 10));

        return ViolationTypeResource::collection($violationTypes);
    }

    public function store(StoreViolationTypeRequest $request): ViolationTypeResource|JsonResponse
    {
        $data = $request->validated();
        $data['is_active'] ??= true;

        $violationType = ViolationType::create($data);

        return (new ViolationTypeResource($violationType))->response()->setStatusCode(Response::HTTP_CREATED);
    }

    public function update(UpdateViolationTypeRequest $request, ViolationType $violationType): ViolationTypeResource
    {
        $violationType->update($request->validated());

        return new ViolationTypeResource($violationType);
    }

    public function destroy(Request $request, ViolationType $violationType): JsonResponse
    {
        $violationType->delete();

        return response()->json(['message' => 'Violation type deleted.']);
    }
}
