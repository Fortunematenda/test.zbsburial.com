<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CreditsTrailModel extends Model
{
    use HasFactory;
    protected $table = "credits_trail";
    public $timestamps = false;
    
    // Map Laravel's timestamp system to existing database columns
    const CREATED_AT = 'date_entered';
    protected $fillable = [
'user_id', 
'lead_id', 
'credits',
'entered_by',
'transaction_type',
'date_entered'
    ];

    protected $casts = [
        'date_entered' => 'datetime',
    ];
}
