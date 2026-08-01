<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreVisitorRegistrationRequest extends FormRequest
{
    public const PURPOSES = [
        'Meeting with faculty/staff',
        'Parent / guardian visit',
        'Enrollment / records',
        'Library visit',
        'Job interview',
        'OJT / internship',
        'Delivery',
        'Event attendance',
        'Maintenance / repair',
        'Other',
    ];

    public const ID_TYPES = [
        "Driver's License",
        'Passport',
        'National ID',
        'UMID (SSS)',
        'GSIS eCard',
        'PRC License',
        'Postal ID',
        'PhilHealth ID',
        'TIN ID',
        "Voter's ID",
        'Senior Citizen ID',
        'PWD ID',
        'School ID',
        'Company / Employee ID',
        'Barangay ID',
    ];

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'fullname' => ['required', 'string', 'max:255'],
            'contact' => [
                'required',
                'string',
                'regex:/^(?:\+639|09)\d{9}$/',
                Rule::unique('visitor_registrations', 'contact')->where(function ($query) {
                    return $query->whereDate('visit_date', $this->visit_date);
                }),
            ],
            'purpose' => ['required', 'string', Rule::in(self::PURPOSES)],
            'purpose_other' => ['nullable', 'string', 'max:255', 'required_if:purpose,Other'],
            'person_office_to_visit' => ['required', 'string', 'max:255'],
            'id_type' => ['required', 'string', Rule::in(self::ID_TYPES)],
            'id_number' => ['required', 'string', 'max:255'],
            'visit_date' => ['required', 'date'],
            'website' => ['prohibited'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'contact.regex' => 'Enter a valid PH mobile number (e.g. 0917 123 4567).',
            'contact.unique' => 'This contact number is already registered for the selected visit date.',
            'purpose.in' => 'Select a valid purpose of visit.',
            'purpose_other.required_if' => 'Please specify your purpose.',
            'id_type.in' => 'Select a valid ID type.',
            'website.prohibited' => 'Form submission blocked.',
        ];
    }
}
