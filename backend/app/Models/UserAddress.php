<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserAddress extends Model
{
    //
    protected $primaryKey = 'address_id';

    protected $fillable = [
        'user_id',
        'recipient_name',
        'phone',
        'email',
        'address',
        'ward',
        'district',
        'city',
        'is_default'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
