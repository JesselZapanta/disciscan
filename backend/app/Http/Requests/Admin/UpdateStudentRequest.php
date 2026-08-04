<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateStudentRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'id_number' => [
                'required', 'string', 'max:50',
                Rule::unique('students', 'id_number')->ignore($this->route('student'))->where(function ($query) {
                    $query->where('academic_year_id', $this->input('academic_year_id'));
                }),
            ],
            'firstname' => ['required', 'string', 'max:255'],
            'middlename' => ['nullable', 'string', 'max:255'],
            'lastname' => ['required', 'string', 'max:255'],
            'contact_no' => ['required', 'string', 'max:20', 'regex:/^[0-9+\-\s]+$/'],
            'program_and_year' => ['required', 'string', 'max:255'],
            'academic_year_id' => ['nullable', 'integer', 'exists:academic_years,id'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'id_number.unique' => 'A student with this ID number already exists for the selected academic year.',
            'contact_no.regex' => 'The contact number may only contain digits, plus, dash, or spaces.',
            'academic_year_id.exists' => 'The selected academic year is invalid.',
        ];
    }
}
