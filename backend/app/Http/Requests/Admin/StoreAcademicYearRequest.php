<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAcademicYearRequest extends FormRequest
{
    public const STATUSES = ['active', 'inactive'];

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:255', Rule::unique('academic_years', 'code')],
            'description' => ['required', 'string', 'max:255'],
            'status' => ['nullable', 'string', Rule::in(self::STATUSES)],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'code.unique' => 'An academic year with this code already exists.',
            'status.in' => 'The selected status is invalid.',
        ];
    }
}
