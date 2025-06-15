<?php

namespace App\Mail;


use Illuminate\Contracts\Queue\ShouldQueue;

use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class CodPaymentSuccessMail extends Mailable
{
    use Queueable, SerializesModels;

    public $order;
    public $user;

    public function __construct($order, $user)
    {
        $this->order = $order;
        $this->user = $user;
    }

    public function build()
    {
        return $this->subject("Bạn đã mua đơn hàng #{$this->order->order_id} thành công")
            ->view('emails.codpayment_success');
    }
}
