<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRoomRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'room_name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('rooms', 'room_name')
                    ->where(fn ($query) => $query->where('building', $this->input('building')))
                    ->ignore($this->route('room')),
            ],
            'building' => ['required', 'string', Rule::in(StoreRoomRequest::BUILDINGS)],
            'floor' => ['required', 'string', Rule::in(StoreRoomRequest::FLOORS)],
            'type' => ['required', 'string', Rule::in(StoreRoomRequest::TYPES)],
            'status' => ['nullable', 'string', Rule::in(StoreRoomRequest::STATUSES)],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'room_name.unique' => 'A room with this name already exists in the selected building.',
            'building.in' => 'The selected building is invalid.',
            'floor.in' => 'The selected floor is invalid.',
            'type.in' => 'The selected type is invalid.',
            'status.in' => 'The selected status is invalid.',
        ];
    }
}
