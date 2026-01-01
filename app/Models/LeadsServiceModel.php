<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeadsServiceModel extends Model
{
    use HasFactory;
    protected $table = "lead_service";
    public $timestamps = false;
    protected $fillable = [
'lead_id', 
'service_details',  
'entered_by', 
    ];
}
