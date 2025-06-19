<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StripeProductsModel extends Model
{
    use HasFactory;
    protected $table = "stripe_products";
    public $timestamps = false;
   
}
