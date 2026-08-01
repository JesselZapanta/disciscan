<?php

namespace App\Models;

use Database\Factories\VisitorTimeLogFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VisitorTimeLog extends Model
{
    /** @use HasFactory<VisitorTimeLogFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'visitor_registration_id',
        'type',
        'time',
        'performed_by',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'time' => 'datetime',
        ];
    }

    public function visitorRegistration(): BelongsTo
    {
        return $this->belongsTo(VisitorRegistration::class);
    }

    public function performedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'performed_by');
    }
}
