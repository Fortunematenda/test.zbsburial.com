<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserServicesModel extends Model
{
    use HasFactory;
    protected $table = "user_services";
    public $timestamps = false;
    public $fillable = [
'user_id', 
'service_id',
'entered_by'

    ];
}
