<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SupportChat extends Model
{
    protected $primaryKey = 'chat_id';

    public $timestamps = false;

    protected $fillable = [
        'customer_id',
        'staff_id',
        'message',
        'sender',
        'sent_at',
        'is_read',
    ];

    protected $casts = [
        'sent_at' => 'datetime',
    ];
    public function attachments()
    {
        return $this->hasMany(SupportChatAttachment::class, 'chat_id');
    }

    public function notifications()
    {
        return $this->hasMany(SupportChatNotification::class, 'chat_id');
    }
}
