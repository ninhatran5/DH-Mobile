<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductSpecifications extends Model
{
    //
    use SoftDeletes;
    protected $table = 'product_specifications';
    protected $primaryKey = 'spec_id';
    protected $fillable = [
        'product_id',
        'spec_name',
        'spec_value',
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'product_id');
    }
}
