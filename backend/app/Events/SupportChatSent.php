<?php

namespace App\Events;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\InteractsWithSockets;
use App\Models\SupportChat;

class SupportChatSent implements ShouldBroadcast
{
    use InteractsWithSockets, SerializesModels;

    public $chat;

    public function __construct(SupportChat $chat)
    {
        $this->chat = $chat;
    }

    public function broadcastOn()
    {
        // Gửi cho cả customer và staff
        return [
            new PrivateChannel('chat.user.' . $this->chat->customer_id),
         new PrivateChannel('chat.admin')
        ];
    }

    public function broadcastAs()
    {
        return 'SupportChatSent';
    }
}
