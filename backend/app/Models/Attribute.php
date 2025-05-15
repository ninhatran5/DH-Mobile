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
        'deleted_at',
    ];
    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'product_id');
    }
}
