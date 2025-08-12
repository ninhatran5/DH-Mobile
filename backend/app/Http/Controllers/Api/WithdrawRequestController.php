<?php

namespace App\Http\Controllers\Api;


use App\Models\Wallet;
use Illuminate\Http\Request;
use App\Models\WithdrawRequest;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Cloudinary\Cloudinary;

class WithdrawRequestController extends Controller
{
    public function addBank(Request $request)
    {
        // Validate the request data
        $validatedData = $request->validate([
            'bank_name' => 'required|string|max:255',
            'bank_account_number' => [
                'required',
                'string',
                'max:255',
                Rule::unique('withdraw_requests')->where(function ($query) {
                    return $query->where('user_id', Auth::id());
                })
            ],
            'bank_account_name' => 'required|string|max:255',
            'beneficiary_bank' => 'nullable|string|max:255',
        ]);

        // Get or create wallet for the user (safety measure)
        $wallet = Wallet::firstOrCreate(
            ['user_id' => Auth::id()],
            ['balance' => 0.00]
        );

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
            ->select('withdraw_id', 'bank_name', 'bank_account_number', 'bank_account_name', 'beneficiary_bank')
            ->whereIn('status', ['Thêm thông tin'])
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

    public function getDetailbank($id)
    {
        $withdraw = WithdrawRequest::findOrFail($id);

        if ($withdraw->user_id !== Auth::id()) {
            return response()->json([
                'message' => 'Bạn không có quyền truy cập thông tin ngân hàng này',
            ], 403);
        }

        return response()->json([
            'message' => 'Lấy thông tin ngân hàng thành công',
            'data' => [
                'withdraw_id' => $withdraw->withdraw_id,
                'bank_name' => $withdraw->bank_name,
                'bank_account_number' => $withdraw->bank_account_number,
                'bank_account_name' => $withdraw->bank_account_name,
                'beneficiary_bank' => $withdraw->beneficiary_bank,
            ]
        ], 200);
    }

    public function deleteBankWithdraw($id)
    {
        $withdraw = WithdrawRequest::findOrFail($id);

        if ($withdraw->user_id !== Auth::id()) {
            return response()->json([
                'message' => 'Bạn không có quyền xóa ngân hàng này',
            ], 403);
        }

        $withdraw->delete();

        return response()->json([
            'message' => 'Xóa ngân hàng thành công',
        ], 200);
    }

    public function requestWithdraw(Request $request)
    {
        $validatedData = $request->validate([
            'amount' => 'required|numeric|min:10000|max:1000000000',
            'withdraw_id' => 'required|exists:withdraw_requests,withdraw_id',
        ]);

        $userId = Auth::id();
        // Get or create wallet for the user (safety measure)
        $wallet = Wallet::firstOrCreate(
            ['user_id' => $userId],
            ['balance' => 0.00]
        );

        if ($wallet->balance < $validatedData['amount']) {
            return response()->json([
                'message' => 'Số dư không đủ để rút tiền',
            ], 400);
        }

        // Lấy thông tin tài khoản ngân hàng từ withdraw_id đã chọn
        $bankInfo = WithdrawRequest::where('withdraw_id', $validatedData['withdraw_id'])
            ->where('user_id', $userId)
            ->first();

        if (!$bankInfo) {
            return response()->json([
                'message' => 'Không tìm thấy thông tin ngân hàng tương ứng.',
            ], 404);
        }

        DB::beginTransaction();

        try {
            // ✅ Trừ tiền ví
            $wallet->balance -= $validatedData['amount'];
            $wallet->save();

            // ✅ Ghi log giao dịch ví
            $transactionId = DB::table('wallet_transactions')->insertGetId([
                'wallet_id' => $wallet->wallet_id,
                'type' => 'rút tiền',
                'amount' => '-' . $validatedData['amount'],
                'note' => 'Yêu cầu rút tiền đang chờ xử lý',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // ✅ Tạo yêu cầu rút tiền mới
            $withdraw = WithdrawRequest::create([
                'user_id' => $userId,
                'wallet_id' => $wallet->wallet_id,
                'transaction_id' => $transactionId,
                'amount' => '-' . $validatedData['amount'],
                'bank_name' => $bankInfo->bank_name,
                'bank_account_number' => $bankInfo->bank_account_number,
                'bank_account_name' => $bankInfo->bank_account_name,
                'beneficiary_bank' => $bankInfo->beneficiary_bank,
                'status' => 'Chờ xử lý',
                'img_qr' => 'https://img.vietqr.io/image/' .
                    str_replace(' ', '', strtolower($bankInfo->bank_name)) . '-' .
                    $bankInfo->bank_account_number .
                    '-compact2.png?amount=' . $validatedData['amount'] .
                    '&addInfo=<Rut tien thanh cong>&accountName=' .
                    urlencode($bankInfo->bank_account_name),
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Yêu cầu rút tiền đã được tạo thành công và số dư đã được trừ.',
                'data' => [
                    'withdraw_id' => $withdraw->withdraw_id,
                    'amount' => $withdraw->amount,
                    'bank_name' => $withdraw->bank_name,
                    'bank_account_number' => $withdraw->bank_account_number,
                    'bank_account_name' => $withdraw->bank_account_name,
                    'beneficiary_bank' => $withdraw->beneficiary_bank,
                    'status' => $withdraw->status,
                    'transaction_id' => $transactionId,
                ]
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Đã xảy ra lỗi: ' . $e->getMessage(),
            ], 500);
        }
    }




    public function getWithdrawalManagement()
    {
        $withdrawals = WithdrawRequest::with('user')
            ->whereIn('status', ['Chờ xử lý', 'Đã hoàn tất']) // lọc theo status
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'message' => 'Lấy danh sách yêu cầu rút tiền thành công',
            'data' => $withdrawals
        ], 200);
    }

    public function postWithdrawalManagement(Request $request, $id)
    {
        $withdraw = WithdrawRequest::findOrFail($id);

        $request->validate([
            'img_bill' => 'required|image|max:2048',
        ]);

        if ($request->hasFile('img_bill')) {
            try {
                // Khởi tạo Cloudinary
                $cloudinary = app(Cloudinary::class);
                $uploadApi = $cloudinary->uploadApi();

                // Upload ảnh lên Cloudinary
                $result = $uploadApi->upload($request->file('img_bill')->getRealPath(), [
                    'folder' => 'img_bill',
                    'public_id' => $withdraw->withdraw_id,
                    'overwrite' => true,
                ]);

                // Gán URL ảnh vào bản ghi rút tiền
                $withdraw->img_bill = $result['secure_url'];
            } catch (\Exception $e) {
                return response()->json([
                    'message' => 'Lỗi khi upload ảnh: ' . $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine()
                ], 500);
            }
        }

        $withdraw->status = 'Đã hoàn tất';
        $withdraw->save();

        if ($withdraw->transaction_id) {
            DB::table('wallet_transactions')
                ->where('transaction_id', $withdraw->transaction_id)
                ->update(['note' => 'Rút tiền thành công']);
        }

        return response()->json([
            'message' => 'Cập nhật trạng thái yêu cầu rút tiền thành công',
            'data' => $withdraw
        ], 200);
    }
}


