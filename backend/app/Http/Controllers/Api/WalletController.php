<?php

namespace App\Http\Controllers\Api;

use App\Models\Wallet;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\WalletTransaction;

class WalletController extends Controller
{
    public function getWallet(Request $request)
    {
        $user = $request->user();
        
        // Get or create wallet for the user (safety measure)
        $wallet = Wallet::firstOrCreate(
            ['user_id' => $user->user_id],
            ['balance' => 0.00]
        );
        
        $data = [
            'wallet_id' => $wallet->wallet_id,
            'balance' => $wallet->balance
        ];
        
        return response()->json([
            'data' => $data
        ]);
    }

    public function getHistoryWallet($id)
    {
        $data = WalletTransaction::with(['withdrawRequest' => function ($query) {
            $query->select(
                'transaction_id',
                'img_bill'
            );
        }])
            ->where('wallet_id', $id)
            ->select('transaction_id', 'wallet_id', 'type', 'amount', 'note', 'created_at') 
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => $data
        ]);
    }
}
