<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Orders extends Model
{
    //
    protected $table = 'orders';
    protected $primaryKey = 'order_id';
    protected $fillable = [
        'order_code',
        'user_id',
        'total_amount',
        'status',
        'payment_status',
        'voucher_id',
        'method_id',
        'cancel_reason',
        'address',
        'ward',
        'district',
        'city',
        'phone',
        'email',
        'customer',
        'rank_discount',
        'voucher_discount',
        'created_at',
        'updated_at',
    ];
    // Một đơn hàng thuộc về một user
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }
    // Một đơn hàng có thể có nhiều order_items
    public function orderItems()
    {
        return $this->hasMany(OrderItems::class, 'order_id', 'order_id');
    }
    // Một đơn hàng có thể có một voucher
    public function voucher()
    {
        return $this->belongsTo(Voucher::class, 'voucher_id', 'voucher_id');
    }
    // Một đơn hàng có thể có nhiều user_vouchers
    public function userVouchers()
    {
        return $this->hasMany(User_vouchers::class, 'order_id', 'order_id');
    }

    public function paymentMethods()
    {
        return $this->belongsTo(Payment_methods::class, 'method_id', 'method_id');
    }
}
