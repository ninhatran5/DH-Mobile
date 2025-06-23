<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class OrderStatusUpdatedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $order;
    public $newStatus;

    /**
     * Create a new message instance.
     */
    public function __construct($order, $newStatus)
    {
        $this->order = $order;
        $this->newStatus = $newStatus;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject('Cập nhật trạng thái đơn hàng')
            ->view('emails.order_status_updated')
            ->with([
                'order' => $this->order,
                'newStatus' => $this->newStatus,
            ]);
    }
}
