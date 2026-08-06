<?php

namespace App\Http\Requests\Guard;

use Illuminate\Foundation\Http\FormRequest;

class StoreStudentViolationRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'violation_type_ids' => ['required', 'array', 'min:1', 'max:10'],
            'violation_type_ids.*' => ['integer', 'exists:violation_types,id'],
            'remarks' => ['nullable', 'string', 'max:2000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'violation_type_ids.required' => 'Select at least one violation type.',
            'violation_type_ids.min' => 'Select at least one violation type.',
            'violation_type_ids.*.exists' => 'One of the selected violation types is invalid.',
        ];
    }
}
