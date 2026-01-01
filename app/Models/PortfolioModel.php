<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PortfolioModel extends Model
{
    protected $table = 'portfolio_models';
    
    protected $fillable = [
        'user_id',
        'title',
        'description',
        'image_path',
        'image_url',
        'contact_person',
        'contact_number',
    ];
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
