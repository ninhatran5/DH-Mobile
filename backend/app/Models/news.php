<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use app\Models\User;
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
        'created_at',
        'updated_at',
        'deleted_at',
    ];
        public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
}
