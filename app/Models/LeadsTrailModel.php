<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeadsTrailModel extends Model
{
    use HasFactory;
    protected $table = "leads_trail";
    public $timestamps = false;
    public $fillable = [
'lead_id', 
'user_id', 
'description', 
'entered_by'
    ];

    public function lead()
    {
        return $this->belongsTo(Lead::class, 'lead_id', 'id');
    }
}

