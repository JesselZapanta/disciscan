<?php

namespace App\Models;

use Database\Factories\StudentFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Student extends Model
{
    /** @use HasFactory<StudentFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'id_number',
        'firstname',
        'middlename',
        'lastname',
        'extension',
        'contact_no',
        'program_and_year',
        'academic_year_id',
    ];

    /**
     * Get the full name of the student.
     */
    public function getFullNameAttribute(): string
    {
        return collect([$this->firstname, $this->middlename, $this->lastname, $this->extension])
            ->filter()
            ->implode(' ');
    }

    public function academicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function timeLogs(): HasMany
    {
        return $this->hasMany(StudentTimeLog::class)->orderByDesc('time')->orderByDesc('id');
    }

    public function violations(): HasMany
    {
        return $this->hasMany(StudentViolation::class)->latest();
    }
}
