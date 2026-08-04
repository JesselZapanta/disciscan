<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PhotoEvidence extends Model
{
    protected $table = 'photo_evidences';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'compliance_id',
        'photo_path',
    ];

    public function compliance(): BelongsTo
    {
        return $this->belongsTo(Compliance::class);
    }
}
