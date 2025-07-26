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
       $data = Wallet::where('user_id', $user->user_id)
           ->select('wallet_id', 'balance')
           ->first();
       return response()->json([
           'data' => $data
       ]);
   }

   public function getHistoryWallet(Request $request, $id)
   {
       $data = WalletTransaction::where('wallet_id', $id)
           ->select('type', 'amount', 'note', 'created_at')
           ->orderBy('created_at', 'desc')
           ->get();
       return response()->json([
           'data' => $data
       ]);
   }
}
