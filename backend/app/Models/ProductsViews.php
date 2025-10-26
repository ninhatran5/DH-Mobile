<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductsViews extends Model
{
    //
    protected $table = 'product_views';
    protected $primaryKey = 'view_id';
    protected $fillable = [
        'user_id',
        'product_id',
        'viewed_at',
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }
}
