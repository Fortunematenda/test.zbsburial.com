<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeadsNotesModel extends Model
{
    use HasFactory;
    protected $table = "lead_notes";
    public $timestamps = false;
    protected $fillable = [
'lead_id', 
'user_id', 
'description',  
'entered_by',
'comm_link'
    ];
}
