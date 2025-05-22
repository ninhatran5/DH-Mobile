<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductLike extends Model
{
    //
    protected $table = 'product_likes';
    protected $primaryKey = 'like_id';
    protected $fillable = [
        'user_id',
        'product_id',
        'created_at',
       
    ];
    public function user()
    {
        return $this->belongsToMany(User::class, 'user_id', 'user_id');
    }
    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'product_id');
    }
}
