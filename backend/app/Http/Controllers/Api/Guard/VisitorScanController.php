<?php

namespace App\Http\Controllers\Api\Guard;

use App\Http\Controllers\Controller;
use App\Http\Requests\Guard\UpdateVisitorRegistrationRequest;
use App\Http\Resources\VisitorRegistrationResource;
use App\Models\VisitorRegistration;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VisitorScanController extends Controller
{
    private const OPERATOR_SELECT = ['id', 'name'];

    public function lookup(string $recordNo): VisitorRegistrationResource|JsonResponse
    {
        $id = $this->parseRecordNo($recordNo);

        if ($id === null) {
            return response()->json(['message' => 'Invalid record number.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $visitor = VisitorRegistration::query()
            ->with(['timeLogs.performedBy:'.implode(',', self::OPERATOR_SELECT)])
            ->find($id);

        if ($visitor === null) {
            return response()->json(['message' => 'Visitor not found.'], Response::HTTP_NOT_FOUND);
        }

        return new VisitorRegistrationResource($visitor);
    }

    public function checkIn(Request $request, VisitorRegistration $visitor): VisitorRegistrationResource|JsonResponse
    {
        if (! $this->visitDateIsToday($visitor)) {
            return response()->json(
                ['message' => 'Cannot check in — the date of visit is not today. Update the date of visit to today first.'],
                Response::HTTP_CONFLICT
            );
        }

        if ($visitor->status === 'checked_in') {
            return response()->json(['message' => 'Visitor is already checked in.'], Response::HTTP_CONFLICT);
        }

        $visitor->timeLogs()->create([
            'type' => 'in',
            'time' => now(),
            'performed_by' => $request->user()->id,
        ]);

        $visitor->update(['status' => 'checked_in']);
        $visitor->load(['timeLogs.performedBy:'.implode(',', self::OPERATOR_SELECT)]);

        return new VisitorRegistrationResource($visitor);
    }

    public function checkOut(Request $request, VisitorRegistration $visitor): VisitorRegistrationResource|JsonResponse
    {
        if (! $this->visitDateIsToday($visitor)) {
            return response()->json(
                ['message' => 'Cannot check out — the date of visit is not today. Update the date of visit to today first.'],
                Response::HTTP_CONFLICT
            );
        }

        if ($visitor->status !== 'checked_in') {
            return response()->json(['message' => 'Visitor must be checked in before checking out.'], Response::HTTP_CONFLICT);
        }

        $visitor->timeLogs()->create([
            'type' => 'out',
            'time' => now(),
            'performed_by' => $request->user()->id,
        ]);

        $visitor->update(['status' => 'checked_out']);
        $visitor->load(['timeLogs.performedBy:'.implode(',', self::OPERATOR_SELECT)]);

        return new VisitorRegistrationResource($visitor);
    }

    public function update(UpdateVisitorRegistrationRequest $request, VisitorRegistration $visitor): VisitorRegistrationResource
    {
        $visitor->update($request->validated());
        $visitor->load(['timeLogs.performedBy:'.implode(',', self::OPERATOR_SELECT)]);

        return new VisitorRegistrationResource($visitor);
    }

    private function visitDateIsToday(VisitorRegistration $visitor): bool
    {
        return $visitor->visit_date !== null && $visitor->visit_date->isToday();
    }

    private function parseRecordNo(string $recordNo): ?int
    {
        if (preg_match('/^VIS-(\d+)$/i', $recordNo, $matches)) {
            return (int) $matches[1];
        }

        if (preg_match('/^\d+$/', $recordNo)) {
            return (int) $recordNo;
        }

        return null;
    }
}
