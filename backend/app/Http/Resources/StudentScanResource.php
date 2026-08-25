<?php

namespace App\Http\Resources;

use App\Models\StudentTimeLog;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StudentScanResource extends JsonResource
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
            'id_number' => $this->id_number,
            'name' => $this->full_name,
            'contact_no' => $this->contact_no,
            'program_and_year' => $this->program_and_year,
            'academic_year' => $this->whenLoaded('academicYear', fn (): ?array => [
                'id' => $this->academicYear->id,
                'code' => $this->academicYear->code,
                'description' => $this->academicYear->description,
            ]),
            'status' => $this->timeLogs?->first()?->type,
            'time_logs' => $this->whenLoaded('timeLogs', fn (): array => $this->timeLogs->filter(
                fn (StudentTimeLog $log): bool => $log->time?->isToday()
            )->map(
                fn (StudentTimeLog $log): array => [
                    'id' => $log->id,
                    'type' => $log->type,
                    'time' => $log->time?->toIso8601String(),
                    'performed_by' => $log->performedBy
                        ? ['id' => $log->performedBy->id, 'name' => $log->performedBy->name]
                        : null,
                ]
            )->values()->all()),
            'created_at' => $this->created_at,
        ];
    }
}
