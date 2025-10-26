<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderCancelledByAdminMail extends Mailable
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

    public function build()
    {
        return $this->subject('Đơn hàng #' . $this->order->order_code . ' đã bị hủy')
            ->view('emails.order_cancelled_by_admin');
    }
}
