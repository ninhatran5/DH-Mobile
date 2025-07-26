<?php

namespace App\Http\Controllers\Api;

use App\Models\Wallet;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

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
}
