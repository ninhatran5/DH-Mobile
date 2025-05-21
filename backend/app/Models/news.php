<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
class news extends Model
{
    //
    use SoftDeletes;
    protected $table = 'news';
    protected $primaryKey = 'news_id';
    protected $fillable = [
        'title',
        'content',
        'image_url',
        'created_at',
        'updated_at',
        'deleted_at',
    ];
}
