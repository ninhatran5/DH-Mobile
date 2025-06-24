<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Voucher extends Model
{
    //
    use SoftDeletes;
    protected $table = 'vouchers';
    protected $primaryKey = 'voucher_id';

    protected $fillable = [
        'code',
        'discount_amount',
        'title',
        'min_order_value',
        'quantity',
        'start_date',
        'end_date',
        'is_active',
        'created_at',
        'updated_at',
        'deleted_at'
    ];

    // Một voucher có thể được gán cho nhiều đơn hàng
    public function orders()
    {
        return $this->hasMany(Orders::class, 'voucher_id', 'voucher_id');
    }

    // Một voucher có thể được cấp cho nhiều user_vouchers
    public function userVouchers()
    {
        return $this->hasMany(User_vouchers::class, 'voucher_id', 'voucher_id');
    }
}
