<?php

namespace App\Models;

use App\Models\ReturnRequest;
use Illuminate\Database\Eloquent\Model;

class WalletTransaction extends Model
{
    protected $primaryKey = 'transaction_id';
    protected $fillable = ['wallet_id', 'type', 'amount', 'note', 'return_id'];

    public function wallet()
    {
        return $this->belongsTo(Wallet::class, 'wallet_id');
    }

    public function returnRequest()
    {
        return $this->belongsTo(ReturnRequest::class, 'return_id');
    }

    public function withdrawRequest()
    {
        return $this->belongsTo(WithdrawRequest::class, 'transaction_id', 'transaction_id');
    }
}
