<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeadsModel extends Model
{
    use HasFactory;
    protected $table = "leads";
    public $timestamps = false;
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
'temp_code'
    ];
    
public function trails()
{
    return $this->hasMany(LeadTrail::class, 'lead_id', 'id');
}
}