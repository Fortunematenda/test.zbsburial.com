<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CreditTransactionModel extends Model
{
    use HasFactory;

    protected $table = "credits_trail";

    protected $fillable = [
        'user_id',
        'credits_changed',
        'transaction_type',
        'description',
    ];

    public function user()
    {
        return $this->belongsTo(User::class); 
    }

}
