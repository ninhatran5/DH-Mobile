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

    public $returnId;
    public $data;

    public function __construct($returnId, $data)
    {
        $this->returnId = $returnId;
        $this->data = $data;
    }

    public function broadcastOn()
    {
        return new Channel('return-request.' . $this->returnId);
    }

    public function broadcastAs()
    {
        return 'return-request-updated';
    }
}
