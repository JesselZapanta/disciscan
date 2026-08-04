<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ComplianceResource extends JsonResource
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
            'room' => [
                'id' => $this->room->id,
                'room_name' => $this->room->room_name,
                'building' => $this->room->building,
                'floor' => $this->room->floor,
                'type' => $this->room->type,
            ],
            'issues' => $this->issues,
            'remarks' => $this->remarks,
            'status' => $this->status,
            'recorded_by' => $this->recorded_by,
            'photo_evidences' => $this->photoEvidences->map(fn ($photo) => [
                'id' => $photo->id,
                'photo_path' => $photo->photo_path,
                'url' => Storage::disk('public')->url($photo->photo_path),
            ]),
            'created_at' => $this->created_at,
        ];
    }
}
