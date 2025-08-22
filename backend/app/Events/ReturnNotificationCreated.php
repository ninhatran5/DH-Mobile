<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ReturnNotificationCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $notification;

    public function __construct($notification)
    {
        $this->notification = $notification;
    }

    // Kênh broadcast riêng cho admin
    public function broadcastOn()
    {
        return new PrivateChannel('admin.notifications');
    }

    public function broadcastWith()
    {
        return [
            'id' => $this->notification->id,
            'order_id' => $this->notification->order_id,
            'return_request_id' => $this->notification->return_request_id,
            'message' => $this->notification->message,
            'is_read' => $this->notification->is_read,
            'created_at' => $this->notification->created_at->toDateTimeString(),
        ];
    }
}
