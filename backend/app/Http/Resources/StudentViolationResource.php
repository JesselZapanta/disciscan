<?php

namespace App\Http\Resources;

use App\Models\ViolationType;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StudentViolationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'student' => [
                'id' => $this->student->id,
                'id_number' => $this->student->id_number,
                'name' => $this->student->full_name,
                'program_and_year' => $this->student->program_and_year,
            ],
            'violation_types' => ViolationType::query()
                ->whereIn('id', $this->violation_type_ids ?? [])
                ->orderBy('name')
                ->get()
                ->map(fn (ViolationType $type): array => [
                    'id' => $type->id,
                    'name' => $type->name,
                ])
                ->values(),
            'remarks' => $this->remarks,
            'status' => $this->status,
            'recorded_by' => $this->recordedBy
                ? ['id' => $this->recordedBy->id, 'name' => $this->recordedBy->name]
                : null,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
