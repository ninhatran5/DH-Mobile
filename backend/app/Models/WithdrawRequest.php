<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WithdrawRequest extends Model
{
    protected $table = 'withdraw_requests';
    protected $primaryKey = 'withdraw_id';
    protected $fillable = [
        'user_id',
        'wallet_id',
        'amount',
        'bank_name',
        'bank_account_number',
        'bank_account_name',
        'beneficiary_bank',
        'status',
        'img_qr',
        'transaction_id'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function wallet()
    {
        return $this->belongsTo(Wallet::class, 'wallet_id');
    }
}
