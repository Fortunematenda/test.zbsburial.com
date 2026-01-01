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

    /**
     * Get the user this service belongs to
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the service
     */
    public function service()
    {
        return $this->belongsTo(ServicesModel::class, 'service_id');
    }
}
