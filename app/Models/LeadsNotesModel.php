<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeadsNotesModel extends Model
{
    use HasFactory;
    protected $table = "lead_notes";
    public $timestamps = false;
    
    // Map Laravel's timestamp system to existing database columns
    // Note: date_entered is used manually in the application code
    protected $fillable = [
'lead_id', 
'user_id', 
'description',  
'entered_by',
'comm_link'
    ];

    /**
     * Get the user that sent the message
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the lead this note belongs to
     */
    public function lead()
    {
        return $this->belongsTo(LeadsModel::class, 'lead_id');
    }
}
