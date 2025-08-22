<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReturnNotification extends Model
{
    use HasFactory;

    protected $table = 'return_notifications';
    protected $primaryKey = 'return_notification_id';
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'order_id',
        'return_request_id',
        'message',
        'is_read',
    ];

    // Quan hệ với đơn hàng
    public function order()
    {
        return $this->belongsTo(Orders::class, 'order_id', 'order_id');
    }

    // Quan hệ với yêu cầu hoàn hàng
    public function returnRequest()
    {
        return $this->belongsTo(ReturnRequest::class, 'return_request_id', 'return_id');
    }
}
