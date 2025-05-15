<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use \Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    //
    use SoftDeletes;
    protected $table = 'products';
    protected $primaryKey = 'product_id';
    protected $fillable = [
        'name',
        'category_id',
        'description',
        'image_url',
        'created_at',
        'updated_at',
        'deleted_at',
    ];
    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id', 'category_id');
    }
}
