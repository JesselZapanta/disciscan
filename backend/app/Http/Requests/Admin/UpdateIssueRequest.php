<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateIssueRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', Rule::unique('issues', 'name')->ignore($this->route('issue'))],
            'description' => ['required', 'string'],
            'status' => ['nullable', 'string', Rule::in(StoreIssueRequest::STATUSES)],
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
