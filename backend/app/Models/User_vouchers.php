<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User_vouchers extends Model
{
    protected $table = 'user_vouchers';
    protected $primaryKey = 'user_voucher_id';

    protected $fillable = [
        'user_id',
        'voucher_id',
        'is_used',
        'used_at',
        'created_at',
        'updated_at',
    ];

    // Một user_voucher thuộc về một user
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    // Một user_voucher thuộc về một voucher
    public function voucher()
    {
        return $this->belongsTo(Vorcher::class, 'voucher_id', 'voucher_id');
    }
}
