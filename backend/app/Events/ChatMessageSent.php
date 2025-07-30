<?php
// app/Events/ChatMessageSent.php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ChatMessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;
    public $response;
    public $userId;
    public $timestamp;
    public $messageId;

    public function __construct($message, $response, $userId = null)
    {
        $this->message = $message;
        $this->response = $response;
        $this->userId = $userId;
        $this->timestamp = now()->toISOString();
        $this->messageId = uniqid();
    }

    public function broadcastOn()
    {
        if ($this->userId) {
            return new PrivateChannel("chat.{$this->userId}");
        }
        
        return new Channel("chat.guest.{session()->getId()}");
    }

    public function broadcastWith()
    {
        return [
            'messageId' => $this->messageId,
            'message' => $this->message,
            'response' => $this->response,
            'userId' => $this->userId,
            'timestamp' => $this->timestamp,
            'type' => 'chat_response'
        ];
    }

    public function broadcastAs()
    {
        return 'message.sent';
    }
}
