<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Category extends Model
{
    //
    use SoftDeletes;
    protected $table = 'categories';
    protected $primaryKey = 'category_id';
    protected $fillable = [
        'name',
        'description',
        'image_url',
        'created_at',
        'updated_at',
        'deleted_at',
    ];
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }
}
