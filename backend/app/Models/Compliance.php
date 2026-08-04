<?php

namespace App\Models;

use Database\Factories\ComplianceFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Compliance extends Model
{
    /** @use HasFactory<ComplianceFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'room_id',
        'issues',
        'remarks',
        'status',
        'recorded_by',
    ];

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    public function photoEvidences(): HasMany
    {
        return $this->hasMany(PhotoEvidence::class);
    }
}
