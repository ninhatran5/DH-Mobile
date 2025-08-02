<?php

namespace App\Http\Controllers\Api;

use App\Models\Wallet;
use Illuminate\Http\Request;
use App\Models\WithdrawRequest;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;

class WithdrawRequestController extends Controller
{
    public function addBank(Request $request)
    {
        // Validate the request data
        $validatedData = $request->validate([
            'bank_name' => 'required|string|max:255',
            'bank_account_number' => 'required|string|max:255',
            'bank_account_name' => 'required|string|max:255',
            'beneficiary_bank' => 'required|string|max:255',
        ]);

        $wallet = Wallet::where('user_id', Auth::id())->firstOrFail();

        WithdrawRequest::create([
            'user_id' => Auth::id(),
            'wallet_id' => $wallet->wallet_id,
            'amount' => 0,
            'bank_name' => $validatedData['bank_name'],
            'bank_account_number' => $validatedData['bank_account_number'],
            'bank_account_name' => $validatedData['bank_account_name'],
            'beneficiary_bank' => $validatedData['beneficiary_bank'],
        ]);

        return response()->json([
            'message' => 'Thêm ngân hàng thành công',
            'data' => $validatedData
        ], 201);
    }

    public function getBank()
{
    $userId = Auth::id();
    $bank = WithdrawRequest::where('user_id', $userId)
                ->latest() 
                ->first();

    if (!$bank) {
        return response()->json([
            'message' => 'Chưa có thông tin ngân hàng',
            'data' => null
        ], 404);
    }

    return response()->json([
        'message' => 'Lấy thông tin ngân hàng thành công',
        'data' => [
            'bank_name' => $bank->bank_name,
            'bank_account_number' => $bank->bank_account_number,
            'bank_account_name' => $bank->bank_account_name,
            'beneficiary_bank' => $bank->beneficiary_bank ?? null
        ]
    ], 200);
}

}
