<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Attribute extends Model
{
    //
    use SoftDeletes;
    protected $table = 'attributes';
    protected $primaryKey = 'attribute_id';
    protected $fillable = [
        'name',
        'created_at',
        'updated_at',
        'deleted_at',
    ];
    public function attributeValues()
    {
        return $this->hasMany(AttributeValue::class, 'attribute_id', 'attribute_id');
    }
}
