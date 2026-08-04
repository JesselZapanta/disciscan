<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreComplianceRequest;
use App\Http\Requests\Admin\UpdateComplianceRequest;
use App\Http\Resources\Admin\ComplianceResource;
use App\Models\Compliance;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

class ComplianceController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $compliances = Compliance::query()
            ->with(['room', 'photoEvidences'])
            ->when($request->filled('search'), function ($query) use ($request): void {
                $search = trim($request->input('search'));
                $query->where(function ($query) use ($search): void {
                    $query->where('issues', 'like', "%{$search}%")
                        ->orWhere('remarks', 'like', "%{$search}%")
                        ->orWhere('recorded_by', 'like', "%{$search}%")
                        ->orWhereHas('room', fn ($room) => $room->where('room_name', 'like', "%{$search}%"));
                });
            })
            ->when(
                $request->filled('status') && in_array($request->input('status'), StoreComplianceRequest::STATUSES, true),
                fn ($query) => $query->where('status', $request->input('status'))
            )
            ->orderBy('id', $request->input('sort_dir', 'desc') === 'asc' ? 'asc' : 'desc')
            ->paginate($request->integer('per_page', 10));

        return ComplianceResource::collection($compliances);
    }

    public function show(Compliance $compliance): ComplianceResource
    {
        $compliance->load(['room', 'photoEvidences']);

        return new ComplianceResource($compliance);
    }

    public function store(StoreComplianceRequest $request): ComplianceResource|JsonResponse
    {
        $data = $request->validated();
        $data['issues'] = (string) ($data['issues'] ?? '');
        $data['status'] = filled($data['issues']) ? 'Non-Compliant' : 'Resolved';
        $data['recorded_by'] = auth()->user()->name;

        $compliance = Compliance::create($data);

        foreach ($request->file('photo_evidences', []) as $file) {
            $compliance->photoEvidences()->create([
                'photo_path' => $file->store('compliances', 'public'),
            ]);
        }

        $compliance->load(['room', 'photoEvidences']);

        return (new ComplianceResource($compliance))->response()->setStatusCode(Response::HTTP_CREATED);
    }

    public function update(UpdateComplianceRequest $request, Compliance $compliance): ComplianceResource
    {
        $data = $request->validated();

        if (array_key_exists('issues', $data)) {
            $data['issues'] = (string) $data['issues'];
            $data['status'] = filled($data['issues']) ? 'Non-Compliant' : 'Resolved';
        }

        $compliance->update($data);

        foreach ($request->file('photo_evidences', []) as $file) {
            $compliance->photoEvidences()->create([
                'photo_path' => $file->store('compliances', 'public'),
            ]);
        }

        foreach ($request->input('remove_photo_ids', []) as $photoId) {
            $photo = $compliance->photoEvidences()->find($photoId);

            if ($photo) {
                Storage::disk('public')->delete($photo->photo_path);
                $photo->delete();
            }
        }

        $compliance->load(['room', 'photoEvidences']);

        return new ComplianceResource($compliance);
    }

    public function destroy(Request $request, Compliance $compliance): JsonResponse
    {
        foreach ($compliance->photoEvidences as $photo) {
            Storage::disk('public')->delete($photo->photo_path);
        }

        $compliance->delete();

        return response()->json(['message' => 'Compliance record deleted.']);
    }
}
