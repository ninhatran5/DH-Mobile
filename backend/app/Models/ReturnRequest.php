<?php 

namespace App\Models;


use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReturnRequest extends Model
{
    protected $table = 'return_requests';
    protected $primaryKey = 'return_id';

    protected $fillable = [
        'order_id',
        'user_id',
        'reason',
        'status',
        'refund_amount',
    ];

    public $timestamps = true;

    /**
     * Đơn hàng liên kết
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Orders::class, 'order_id');
    }

    /**
     * Người dùng gửi yêu cầu hoàn hàng
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Giao dịch ví liên kết (nếu có)
     */
    public function walletTransaction()
    {
        return $this->hasOne(WalletTransaction::class, 'return_id');
    }
}
