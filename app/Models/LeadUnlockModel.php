<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LeadUnlockModel extends Model
{
    protected $table = 'lead_unlocks';

    protected $fillable = [
        'lead_id',
        'provider_id',
        'credits_paid',
        'unlocked_at',
    ];

    protected $casts = [
        'unlocked_at' => 'datetime',
        'credits_paid' => 'integer',
    ];

    /**
     * Get the lead that was unlocked
     */
    public function lead()
    {
        return $this->belongsTo(LeadsModel::class, 'lead_id');
    }

    /**
     * Get the provider/user who unlocked the lead
     */
    public function provider()
    {
        return $this->belongsTo(User::class, 'provider_id');
    }
}
