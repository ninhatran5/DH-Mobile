<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment_methods extends Model
{
    //
    protected $table = 'payment_methods';
    protected $primaryKey = 'method_id';

    protected $fillable = [
        'name',
        'description',
        'is_active',
        'created_at',
        'updated_at'
    ];
}
