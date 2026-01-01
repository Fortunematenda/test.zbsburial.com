<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RatingsModel extends Model
{
    use HasFactory;
    protected $table = "ratings";
    public $timestamps = false;
    public $fillable = [
'from_user_id', 'to_user_id', 'lead_id', 'rating', 'comment', 
    ];

    /**
     * Get the user who gave this rating
     */
    public function fromUser()
    {
        return $this->belongsTo(User::class, 'from_user_id');
    }

    /**
     * Get the user who received this rating
     */
    public function toUser()
    {
        return $this->belongsTo(User::class, 'to_user_id');
    }

    /**
     * Get the lead associated with this rating
     */
    public function lead()
    {
        return $this->belongsTo(LeadsModel::class, 'lead_id');
    }
}
