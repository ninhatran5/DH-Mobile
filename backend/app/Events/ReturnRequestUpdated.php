<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

class ReturnRequestUpdated implements ShouldBroadcastNow
{
    use InteractsWithSockets, SerializesModels;

    public $orderId;
    public $data;

    public function __construct($orderId, $data)
    {
        $this->orderId = $orderId;
        $this->data = $data;
    }

    public function broadcastOn()
    {
        return new Channel('order.' . $this->orderId);
    }

    public function broadcastAs()
    {
        return 'order-return-updated';
    }
}
