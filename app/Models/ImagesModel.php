<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ImagesModel extends Model
{
    use HasFactory;
    protected $table = "images";
    public $timestamps = false;
    
    // Map Laravel's timestamp system to existing database columns
    const CREATED_AT = 'date_entered';
    protected $fillable = [
'image_name', 
'category', 
'entered_by',  
'user_id', 
'lead_id', 
'image_url',
'date_entered',

    ];

    /**
     * Get the lead this image belongs to
     */
    public function lead()
    {
        return $this->belongsTo(LeadsModel::class, 'lead_id');
    }

    /**
     * Get the user who uploaded this image
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}