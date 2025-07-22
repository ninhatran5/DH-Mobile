<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderUpdated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $order;
    public $userId;

    public function __construct($order, $userId)
    {
        $this->order = $order;
        $this->userId = $userId;
    }

    public function broadcastOn()
    {
        return new Channel('orders.' . $this->userId);
    }

    public function broadcastWith()
    {
        return ['order' => $this->order];
    }
}
