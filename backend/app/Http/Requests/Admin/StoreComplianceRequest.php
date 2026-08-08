<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreComplianceRequest extends FormRequest
{
    public const STATUSES = ['Non-Compliant', 'Resolved'];

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'room_id' => ['required', 'integer', 'exists:rooms,id'],
            'issues' => ['required', 'string', 'max:1000'],
            'remarks' => ['nullable', 'string', 'max:2000'],
            'photo_evidences' => ['required', 'array', 'min:1'],
            'photo_evidences.*' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'room_id.exists' => 'The selected room is invalid.',
            'issues.required' => 'Select at least one issue.',
            'photo_evidences.required' => 'At least one photo evidence is required.',
            'photo_evidences.min' => 'At least one photo evidence is required.',
            'photo_evidences.*.image' => 'Each photo evidence must be an image.',
            'photo_evidences.*.mimes' => 'Photo evidence must be a JPG, PNG or WEBP image.',
            'photo_evidences.*.max' => 'Each photo evidence must be 5MB or smaller.',
        ];
    }
}
