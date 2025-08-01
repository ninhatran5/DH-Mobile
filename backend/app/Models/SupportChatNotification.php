<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SupportChatNotification extends Model
{
    protected $table = 'support_chat_notifications'; // 🔑 Đảm bảo tên bảng đúng
    protected $primaryKey = 'notification_id';
    public $timestamps = false;

    protected $fillable = [
        'chat_id',
        'user_id',
        'is_read',
    ];

    /**
     * Quan hệ đến bảng SupportChat
     */
    public function chat()
    {
        return $this->belongsTo(SupportChat::class, 'chat_id', 'chat_id');
    }
}
