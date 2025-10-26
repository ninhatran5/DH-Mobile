<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderStatusHistory extends Model
{
    //
    protected $fillable = ['order_id', 'old_status', 'new_status', 'changed_by'];

    public function order()
    {
        return $this->belongsTo(Orders::class);
    }
}
