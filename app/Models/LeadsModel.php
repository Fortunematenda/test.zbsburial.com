<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeadsModel extends Model
{
    use HasFactory;
    protected $table = "leads";
    public $timestamps = false;
    
    // Map Laravel's timestamp system to existing database columns
    const CREATED_AT = 'date_entered';
    // Note: This model uses date_closed for closure tracking instead of updated_at
    protected $fillable = [
'user_id', 
'service_id', 
'credits',  
'entered_by', 
'description', 
'estimate_quote',
'hiring_decision',
'urgent',
'longitude',
'latitude',
'location',
'zipcode',
'temp_code',
'status',
'date_entered',
'hired_expert_id',
'closed_by',
'date_closed',
'closed_description'
    ];
    
public function trails()
{
    return $this->hasMany(LeadTrail::class, 'lead_id', 'id');
}

/**
 * Get the service this lead belongs to
 */
public function service()
{
    return $this->belongsTo(ServicesModel::class, 'service_id');
}

/**
 * Get the user who created this lead
 */
public function user()
{
    return $this->belongsTo(User::class, 'user_id');
}

/**
 * Get all images for this lead
 */
public function images()
{
    return $this->hasMany(ImagesModel::class, 'lead_id');
}

/**
 * Get all users who have contacted this lead
 */
public function contactedLeads()
{
    return $this->hasMany(ContactedLeadsModel::class, 'lead_id');
}

/**
 * Get the expert who was hired for this lead
 */
public function hiredExpert()
{
    return $this->belongsTo(User::class, 'hired_expert_id');
}

/**
 * Get all notes/messages for this lead
 */
public function notes()
{
    return $this->hasMany(LeadsNotesModel::class, 'lead_id');
}

/**
 * Get all unlock records for this lead
 */
public function unlocks()
{
    return $this->hasMany(LeadUnlockModel::class, 'lead_id');
}
}