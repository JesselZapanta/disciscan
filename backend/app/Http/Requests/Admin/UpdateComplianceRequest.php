<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateComplianceRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'room_id' => ['required', 'integer', 'exists:rooms,id'],
            'issues' => ['sometimes', 'required', 'string', 'max:1000'],
            'remarks' => ['nullable', 'string', 'max:2000'],
            'status' => ['sometimes', 'string', Rule::in(StoreComplianceRequest::STATUSES)],
            'photo_evidences' => ['nullable', 'array'],
            'photo_evidences.*' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'remove_photo_ids' => ['nullable', 'array'],
            'remove_photo_ids.*' => ['integer'],
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
            'status.in' => 'The selected status is invalid.',
            'photo_evidences.*.image' => 'Each photo evidence must be an image.',
            'photo_evidences.*.mimes' => 'Photo evidence must be a JPG, PNG, JPEG or WEBP image.',
            'photo_evidences.*.max' => 'Each photo evidence must be 5MB or smaller.',
        ];
    }
}
