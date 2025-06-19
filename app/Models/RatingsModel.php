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
}
