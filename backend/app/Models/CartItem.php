<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CartItem extends Model
{
    //
    protected $table = 'cart_items';
    protected $primaryKey = 'cart_item_id';
    protected $fillable = [
        'cart_id',
        'variant_id',
        'price_snapshot',
        'quantity',
        'created_at',
        'updated_at',
    ];
    public function cart()
    {
        return $this->belongsTo(Cart::class, 'cart_id', 'cart_id');
    }
    public function variant()
    {
        return $this->belongsTo(ProductVariant::class, 'variant_id', 'variant_id');
    }
}
