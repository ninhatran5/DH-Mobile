<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SupportChatNotification extends Model
{
    protected $primaryKey = 'notification_id';
    public $timestamps = false;

    protected $fillable = ['chat_id', 'user_id', 'is_read'];

    public function chat()
    {
        return $this->belongsTo(SupportChat::class, 'chat_id');
    }
}
