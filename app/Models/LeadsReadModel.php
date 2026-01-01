<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeadsReadModel extends Model
{
    use HasFactory;
    protected $table = "leads_read";
    public $timestamps = false;
    protected $fillable = [
'user_id', 
'lead_id', 
'entered_by'
    ];
}
