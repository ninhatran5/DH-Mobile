<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AttributeValue extends Model
{
    //
    use SoftDeletes;
    protected $table = 'attribute_values';
    protected $primaryKey = 'value_id';
    protected $fillable = [
        'attribute_id',
        'created_at',
        'value',
        'updated_at',
        'deleted_at',
    ];
    public function attribute()
    {
        return $this->belongsTo(Attribute::class, 'attribute_id', 'attribute_id');
    }
    public function variantAttributeValues()
    {
        return $this->hasMany(VariantAttributeValue::class, 'value_id', 'value_id');
    }
}
