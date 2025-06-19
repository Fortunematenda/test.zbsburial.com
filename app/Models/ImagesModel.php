<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ImagesModel extends Model
{
    use HasFactory;
    protected $table = "images";
    public $timestamps = false;
    protected $fillable = [
'image_name', 
'category', 
'entered_by',  
'user_id', 
'lead_id', 

    ];

}