<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TrailsModel extends Model
{
    use HasFactory;
    protected $table = "trails";
    public $timestamps = false;
    public $fillable = [
'trail', 
    ];
}
