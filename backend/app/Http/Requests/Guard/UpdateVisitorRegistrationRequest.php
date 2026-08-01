<?php

namespace App\Http\Requests\Guard;

use App\Http\Requests\StoreVisitorRegistrationRequest;
use Illuminate\Validation\Rule;

class UpdateVisitorRegistrationRequest extends StoreVisitorRegistrationRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $rules = parent::rules();

        $rules['contact'] = [
            'required',
            'string',
            'regex:/^(?:\+639|09)\d{9}$/',
            Rule::unique('visitor_registrations', 'contact')
                ->where(function ($query) {
                    return $query->whereDate('visit_date', $this->visit_date);
                })
                ->ignore($this->route('visitor')?->id),
        ];

        return $rules;
    }
}
