<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServicePossibleAnswerModel extends Model
{
    use HasFactory;

    protected $table = 'service_possible_answers';

    protected $fillable = [
        'service_question_id',
        'service_possible_answers',
        'date_entered',
        'entered_by',
        'status',
    ];

  
    public function question()
    {
        return $this->belongsTo(ServiceQuestion::class, 'service_question_id');
    }
}
