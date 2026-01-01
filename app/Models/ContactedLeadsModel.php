<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ContactedLeadsModel extends Model
{
    use HasFactory;
    protected $table = "contacted_lead";
    public $timestamps = false;
    
    // Map Laravel's timestamp system to existing database columns
    const CREATED_AT = 'date_entered';
    public $fillable = [
'user_id', 
'lead_id',
'entered_by',
'status',
'date_entered'
    ];

    /**
     * Get the user who contacted the lead
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the lead that was contacted
     */
    public function lead()
    {
        return $this->belongsTo(LeadsModel::class, 'lead_id');
    }
}
