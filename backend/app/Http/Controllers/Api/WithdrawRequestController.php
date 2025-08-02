<?php

namespace App\Http\Controllers\Api;

use App\Models\Wallet;
use Illuminate\Http\Request;
use App\Models\WithdrawRequest;
use Illuminate\Support\Facades\DB;
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

        // Lấy danh sách ngân hàng không trùng dựa vào 4 trường ngân hàng
        $banks = WithdrawRequest::where('user_id', $userId)
            ->select('bank_name', 'bank_account_number', 'bank_account_name', 'beneficiary_bank')
            ->distinct()   // loại bỏ trùng lặp
            ->get();

        if ($banks->isEmpty()) {
            return response()->json([
                'message' => 'Chưa có thông tin ngân hàng',
                'data' => []
            ], 404);
        }

        return response()->json([
            'message' => 'Lấy thông tin ngân hàng thành công',
            'data' => $banks
        ], 200);
    }




    public function requestWithdraw(Request $request)
    {
        $validatedData = $request->validate([
            'amount' => 'required|numeric|min:10000|max:1000000000',
            'bank_name' => 'required|string|max:255',
            'bank_account_number' => 'required|string|max:255',
            'bank_account_name' => 'required|string|max:255',
            'beneficiary_bank' => 'nullable|string|max:255',
        ]);

        $userId = Auth::id();
        $wallet = Wallet::where('user_id', $userId)->firstOrFail();

        // ✅ Kiểm tra số dư
        if ($wallet->balance < $validatedData['amount']) {
            return response()->json([
                'message' => 'Số dư không đủ để rút tiền',
            ], 400);
        }

        // ✅ Kiểm tra ngân hàng có tồn tại trong DB không
        $bankExists = WithdrawRequest::where('user_id', $userId)
            ->where('bank_name', $validatedData['bank_name'])
            ->where('bank_account_number', $validatedData['bank_account_number'])
            ->where('bank_account_name', $validatedData['bank_account_name'])
            ->where('beneficiary_bank', $validatedData['beneficiary_bank'])
            ->exists();

        if (!$bankExists) {
            return response()->json([
                'message' => 'Tài khoản ngân hàng này chưa được lưu, vui lòng thêm trước khi rút tiền.',
            ], 400);
        }

        // ✅ Tạo yêu cầu rút tiền
        $withdraw = WithdrawRequest::create([
            'user_id' => $userId,
            'wallet_id' => $wallet->wallet_id,
            'amount' => '-' . $validatedData['amount'],
            'bank_name' => $validatedData['bank_name'],
            'bank_account_number' => $validatedData['bank_account_number'],
            'bank_account_name' => $validatedData['bank_account_name'],
            'beneficiary_bank' => $validatedData['beneficiary_bank'],
            'status' => 'Chờ xử lý',
        ]);

        // ✅ Trừ tiền trong ví
        $wallet->balance -= $validatedData['amount'];
        $wallet->save();

        // ✅ Ghi vào bảng wallet_transactions
        DB::table('wallet_transactions')->insert([
            'wallet_id' => $wallet->wallet_id,
            'type' => 'rút tiền',
            'amount' => $validatedData['amount'],
            'note' => 'Yêu cầu rút tiền đang chờ xử lý',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'message' => 'Yêu cầu rút tiền đã được tạo thành công và số dư đã được trừ.',
            'data' => $withdraw,
        ], 201);
    }
}
