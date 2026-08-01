<?php

namespace App\Models;

use Database\Factories\VisitorRegistrationFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VisitorRegistration extends Model
{
    /** @use HasFactory<VisitorRegistrationFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'fullname',
        'contact',
        'purpose',
        'purpose_other',
        'person_office_to_visit',
        'id_type',
        'id_number',
        'visit_date',
        'type',
        'status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'visit_date' => 'date',
        ];
    }

    public function timeLogs(): HasMany
    {
        return $this->hasMany(VisitorTimeLog::class)->orderByDesc('time');
    }
}
