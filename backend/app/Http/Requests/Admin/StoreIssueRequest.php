<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreIssueRequest extends FormRequest
{
    public const STATUSES = ['Active', 'Inactive'];

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', Rule::unique('issues', 'name')],
            'description' => ['required', 'string'],
            'status' => ['nullable', 'string', Rule::in(self::STATUSES)],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.unique' => 'An issue with this name already exists.',
            'status.in' => 'The selected status is invalid.',
        ];
    }
}
