<?php

namespace App\Http\Resources;

use App\Models\VisitorTimeLog;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VisitorRegistrationResource extends JsonResource
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
            'record_no' => 'VIS-'.str_pad((string) $this->id, 5, '0', STR_PAD_LEFT),
            'fullname' => $this->fullname,
            'contact' => $this->contact,
            'purpose' => $this->purpose,
            'purpose_other' => $this->purpose_other,
            'person_office_to_visit' => $this->person_office_to_visit,
            'id_type' => $this->id_type,
            'id_number' => $this->id_number,
            'visit_date' => $this->visit_date?->format('Y-m-d'),
            'type' => $this->type,
            'status' => $this->status,
            'checked_in_at' => $this->whenLoaded('timeLogs', fn (): ?string => $this->latestEvent('in')?->time?->toIso8601String()),
            'checked_in_by' => $this->whenLoaded('timeLogs', fn (): ?array => $this->operatorFor($this->latestEvent('in'))),
            'checked_out_at' => $this->whenLoaded('timeLogs', fn (): ?string => $this->latestEvent('out')?->time?->toIso8601String()),
            'checked_out_by' => $this->whenLoaded('timeLogs', fn (): ?array => $this->operatorFor($this->latestEvent('out'))),
            'time_logs' => $this->whenLoaded('timeLogs', fn (): array => $this->timeLogs->map(
                fn (VisitorTimeLog $log): array => [
                    'id' => $log->id,
                    'type' => $log->type,
                    'time' => $log->time?->toIso8601String(),
                    'performed_by' => $this->operatorFor($log),
                ]
            )->values()->all()),
            'created_at' => $this->created_at,
        ];
    }

    private function latestEvent(string $type): ?VisitorTimeLog
    {
        return $this->timeLogs?->firstWhere('type', $type);
    }

    private function operatorFor(?VisitorTimeLog $timeLog): ?array
    {
        return $timeLog?->performedBy
            ? ['id' => $timeLog->performedBy->id, 'name' => $timeLog->performedBy->name]
            : null;
    }
}
