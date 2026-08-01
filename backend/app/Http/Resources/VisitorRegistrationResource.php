<?php

namespace App\Http\Resources;

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
            'status' => $this->status,
            'created_at' => $this->created_at,
        ];
    }
}
