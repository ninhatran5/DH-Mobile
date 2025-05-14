<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Banner extends Model
{
    //
    protected $table = 'banners';
    protected $primaryKey = 'banner_id';
    protected $fillable = [
        'id',
        'title',
        'image_url',
        'link_url',
        'is_active',
    ];
    
}
