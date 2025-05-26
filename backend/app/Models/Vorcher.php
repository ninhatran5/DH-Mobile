<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class Vorcher extends Model
{
    //
    protected $table = 'vouchers';
    protected $primaryKey = 'voucher_id';

    protected $fillable = [
        'code',
        'discount_amount',
        'min_order_value',
        'start_date',
        'end_date',
        'is_active',
        'created_at',
        'updated_at',
    ];

    // Một voucher có thể được gán cho nhiều đơn hàng
    // public function orders()
    // {
    //     return $this->hasMany(Order::class, 'voucher_id', 'voucher_id');
    // }

    // // Một voucher có thể được cấp cho nhiều user_vouchers
    // public function userVouchers()
    // {
    //     return $this->hasMany(UserVoucher::class, 'voucher_id', 'voucher_id');
    // }
}
