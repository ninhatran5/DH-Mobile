<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class VariantAttributeValue extends Model
{
    //
    use SoftDeletes;
    protected $table = 'variant_attribute_values';
    protected $primaryKey = 'id';
    protected $fillable = [
        'variant_id',
        'value_id',
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    public function variant()
    {
        return $this->belongsTo(ProductVariant::class, 'variant_id');
    }

    public function value()
    {
        return $this->belongsTo(AttributeValue::class, 'value_id');
    }
}
