<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    protected $primaryKey = 'comment_id';
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'product_id',
        'rating',
        'content',
        'created_at'
    ];

    protected static function booted()
    {
        static::creating(function ($comment) {
            $comment->created_at = now();
        });
    }
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }
    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'product_id');
    }
}
