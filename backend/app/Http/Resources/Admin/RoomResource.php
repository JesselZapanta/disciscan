<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoomResource extends JsonResource
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
            'room_name' => $this->room_name,
            'building' => $this->building,
            'floor' => $this->floor,
            'type' => $this->type,
            'status' => $this->status,
            'created_at' => $this->created_at,
        ];
    }
}
