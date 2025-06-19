<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\User;

class news extends Model
{
    //
    use SoftDeletes;
    protected $table = 'news';
    protected $primaryKey = 'news_id';
    protected $fillable = [
        'user_id',
        'title',
        'content',
        'image_url',
        'description',
        'created_at',
        'updated_at',
        'deleted_at',
    ];
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id')->select(['user_id', 'full_name', 'image_url']);
    }
}
