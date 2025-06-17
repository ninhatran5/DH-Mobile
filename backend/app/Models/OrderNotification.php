<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Orders;
class OrderNotification extends Model
{
    protected $primaryKey = 'notification_id';

    protected $fillable = [
        'order_id',
        'user_id',
        'type',
        'message',
        'is_read',
        'created_at'
    ];

    public function order()
    {
        return $this->belongsTo(Orders::class, 'order_id');
    }
}

