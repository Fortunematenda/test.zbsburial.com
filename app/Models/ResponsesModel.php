<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ResponsesModel extends Model
{
    use HasFactory;
    protected $table = "contacted_lead";
    public $timestamps = false;
    protected $fillable = [
        'user_id', 
        'service_id', 
        'lead_id',  
        'date_entered', 
        'entered_by', 
        'status', 
    ];
}

