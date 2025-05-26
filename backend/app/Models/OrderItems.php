<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderItems extends Model
{
    //
    protected $table = 'order_items';
    protected $primaryKey = 'order_item_id';
    protected $fillable = [
        'order_id',
        'product_id',
        'quantity',
        'price',
        'created_at',
        'updated_at',
    ];
    // Một order_item thuộc về một đơn hàng
    public function order()
    {
        return $this->belongsTo(Orders::class, 'order_id', 'order_id');
    }
    // Một order_item thuộc về một sản phẩm
    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'product_id');
    }
    // Một order_item thuộc về một biến thể sản phẩm (nếu có)
    public function variant()
    {
        return $this->belongsTo(ProductVariant::class, 'variant_id', 'variant_id');
    }



}
