<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    protected $primaryKey = 'comment_id';
    public $timestamps = false;

    protected $fillable = [
        'user_id', 'product_id', 'rating', 'content', 'created_at'
    ];

    protected static function booted()
    {
        static::creating(function ($comment) {
            $comment->created_at = now();
        });
    }
}

