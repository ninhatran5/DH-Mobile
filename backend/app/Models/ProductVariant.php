<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductVariant extends Model
{
    use SoftDeletes;

    protected $table = 'product_variants';
    protected $primaryKey = 'variant_id';
    protected $fillable = [
        'product_id',
        'sku',
        'price',
        'price_original',
        'image_url',
        'stock',
        'deleted_at',
        'created_at',
        'updated_at',
    ];
    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'product_id');
    }
    public function attributeValues()
    {
        return $this->belongsToMany(AttributeValue::class, 'variant_attribute_values', 'variant_id', 'value_id');
    }
    public function variantAttributeValues()
    {
        return $this->hasMany(VariantAttributeValue::class, 'variant_id', 'variant_id');
    }
    public function cartItems()
    {
        return $this->hasMany(CartItem::class, 'variant_id', 'variant_id');
    }
}
