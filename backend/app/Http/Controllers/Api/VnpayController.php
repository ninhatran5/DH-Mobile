<?php

namespace App\Http\Controllers\Api;

use Carbon\Carbon;
use App\Models\Orders;
use App\Models\Wallet;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Mail\PaymentSuccessMail;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;

class VnpayController extends Controller
{

    public function createWalletPaymentOrder(Request $request)
    {
        $user = Auth::user();
        $items = $request->input('items');

        $validated = $request->validate([
            'address' => 'required|string',
            'ward' => 'required|string',
            'district' => 'required|string',
            'city' => 'required|string',
            'phone' => 'required|string',
            'email' => 'required|email',
            'customer' => 'required|string',
            'items' => 'required|array|min:1',
            'voucher_id' => 'nullable|integer',
            'rank_discount' => 'nullable|integer',
        ]);

        // Validate cart & stock
        $cart = DB::table('carts')->where('user_id', $user->user_id)->first();
        if (!$cart) return response()->json(['message' => 'Giỏ hàng không tồn tại'], 400);

        $total = 0;
        foreach ($items as $item) {
            if (!isset($item['variant_id'], $item['quantity'], $item['price_snapshot'])) {
                return response()->json(['message' => 'Dữ liệu sản phẩm không hợp lệ'], 400);
            }
            $variant = DB::table('product_variants')->where('variant_id', $item['variant_id'])->first();
            if (!$variant || $variant->stock < $item['quantity']) {
                return response()->json(['message' => 'Sản phẩm hết hàng hoặc không đủ'], 400);
            }
            $total += $item['price_snapshot'] * $item['quantity'];
        }

        // Tính giảm giá
        $rankDiscount = $request->rank_discount ?? 0;
        $voucherId = $request->input('voucher_id');
        $voucherDiscount = 0;

        if ($voucherId) {
            $voucher = DB::table('vouchers')
                ->where('voucher_id', $voucherId)
                ->where('is_active', 1)
                ->where('start_date', '<=', now())
                ->where('end_date', '>=', now())
                ->where('quantity', '>', 0)
                ->first();
            if ($voucher && $total >= $voucher->min_order_value) {
                $voucherDiscount = $voucher->discount_amount;
            } else {
                $voucherId = null;
            }
        }

        $finalTotal = max($total - $rankDiscount - $voucherDiscount, 0);

        // Kiểm tra số dư ví
        $wallet = Wallet::firstOrCreate(['user_id' => $user->user_id], ['balance' => 0.00]);
        $walletBalance = (float) $wallet->balance;

        $paidByWallet = min($walletBalance, $finalTotal);
        $remaining = $finalTotal - $paidByWallet;

        if ($remaining > 0) {
            // Lưu đơn hàng pending
            $orderCode = $this->generateOrderCode();
            DB::table('pending_orders')->insert([
                'order_code' => $orderCode,
                'user_id' => $user->user_id,
                'items' => json_encode($items),
                'total_amount' => $remaining,
                'voucher_id' => $voucherId,
                'voucher_discount' => $voucherDiscount,
                'rank_discount' => $rankDiscount,
                'paid_by_wallet' => $paidByWallet ?? 0,
                'customer' => $request->customer,
                'address' => $request->address,
                'ward' => $request->ward,
                'district' => $request->district,
                'city' => $request->city,
                'phone' => $request->phone,
                'email' => $request->email,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $vnpUrl = $this->generateVnpayUrl($request, $orderCode, $remaining);

            return response()->json([
                'message' => 'Số dư ví không đủ. Chuyển sang VNPAY.',
                'order_code' => $orderCode,
                'remaining' => $remaining,
                'payment_url' => $vnpUrl,
            ]);
        }

        // Nếu đủ tiền ví thì tạo đơn hàng thật
        DB::beginTransaction();
        try {
            $orderCode = $this->generateOrderCode();
            $orderId = DB::table('orders')->insertGetId([
                'user_id' => $user->user_id,
                'order_code' => $orderCode,
                'method_id' => 3,
                'total_amount' => $finalTotal,
                'status' => 'Chờ xác nhận',
                'payment_status' => 'Đã thanh toán',
                'voucher_id' => $voucherId,
                'voucher_discount' => $voucherDiscount,
                'rank_discount' => $rankDiscount,
                'paid_by_wallet' => $finalTotal,
                'paid_by_vnpay' => 0,
                'address' => $request->address,
                'ward' => $request->ward,
                'district' => $request->district,
                'city' => $request->city,
                'phone' => $request->phone,
                'email' => $request->email,
                'customer' => $request->customer,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            foreach ($items as $item) {
                $variant = DB::table('product_variants')->where('variant_id', $item['variant_id'])->first();
                DB::table('order_items')->insert([
                    'order_id' => $orderId,
                    'product_id' => $variant->product_id,
                    'variant_id' => $item['variant_id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price_snapshot'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                DB::table('product_variants')->where('variant_id', $item['variant_id'])->decrement('stock', $item['quantity']);
            }

            DB::table('wallets')->where('wallet_id', $wallet->wallet_id)->decrement('balance', $finalTotal);
            DB::table('wallet_transactions')->insert([
                'wallet_id' => $wallet->wallet_id,
                'amount' => -$finalTotal,
                'type' => 'tiêu tiền',
                'note' => 'Thanh toán đơn hàng #' . $orderCode,
                'created_at' => now(),
            ]);

            // Xoá cart item
            DB::table('cart_items')
                ->where('cart_id', $cart->cart_id)
                ->whereIn('variant_id', collect($items)->pluck('variant_id'))
                ->delete();

            if ($voucherId) {
                DB::table('vouchers')->where('voucher_id', $voucherId)->decrement('quantity');
                DB::table('user_vouchers')
                    ->where('user_id', $user->user_id)
                    ->where('voucher_id', $voucherId)
                    ->update(['used_at' => now()]);
            }

            DB::commit();

            Mail::to($request->email)->send(new PaymentSuccessMail(DB::table('orders')->where('order_id', $orderId)->first(), $user));

            return response()->json([
                'message' => 'Thanh toán thành công bằng ví',
                'order_id' => $orderId,
                'order_code' => $orderCode,
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json(['message' => 'Đặt hàng thất bại', 'error' => $e->getMessage()], 500);
        }
    }



    public function createPayment(Request $request)
    {
        $user = Auth::user();
        $items = $request->input('items');

        // Validate dữ liệu
        $request->validate([
            'address' => 'required|string',
            'ward' => 'required|string',
            'district' => 'required|string',
            'city' => 'required|string',
            'phone' => 'required|string',
            'email' => 'required|email',
            'customer' => 'required|string',
            'items' => 'required|array|min:1',
            'voucher_id' => 'nullable|integer',
            'rank_discount' => 'nullable|integer',
        ]);

        // Kiểm tra tồn kho (giữ nguyên)
        $total = 0;
        foreach ($items as $item) {
            if (!is_array($item) || !isset($item['variant_id'], $item['quantity'], $item['price_snapshot'])) {
                return response()->json(['message' => 'Dữ liệu sản phẩm không hợp lệ'], 400);
            }

            $variant = DB::table('product_variants')
                ->where('variant_id', $item['variant_id'])
                ->first();

            if (!$variant || $variant->stock < $item['quantity']) {
                return response()->json([
                    'message' => 'Sản phẩm đã hết hàng hoặc không đủ số lượng',
                    'variant_id' => $item['variant_id']
                ], 400);
            }
            if (isset($item['price_snapshot'])) {
                $total += $item['price_snapshot'] * $item['quantity'];
            }
        }

        // Áp dụng giảm giá hạng (rank_discount) nếu có
        $rankDiscount = $request->rank_discount ?? 0;
        if ($rankDiscount > 0) {
            $total = max($total - $rankDiscount, 0);
        }


        // Chỉ tính toán thông tin cần thiết
        $orderCode = $this->generateOrderCode();

        // ==============================
        // Áp dụng voucher nếu có
        $voucherId = $request->input('voucher_id');
        $discount = 0;

        if ($voucherId) {
            $voucher = DB::table('vouchers')
                ->where('voucher_id', $voucherId)
                ->where('is_active', 1)
                ->where('start_date', '<=', now())
                ->where('end_date', '>=', now())
                ->where('quantity', '>', 0)
                ->first();

            if ($voucher && $total >= $voucher->min_order_value) {
                $discount = $voucher->discount_amount;
            } else {
                $voucherId = null; // không hợp lệ
                $discount = 0;
            }
        }
        // ==============================

        $finalAmount = max($total - $discount, 0);

        DB::table('pending_orders')->insert([
            'order_code' => $orderCode,
            'user_id' => $user->user_id,
            'items' => json_encode($items),
            'total_amount' => $finalAmount,
            'voucher_id' => $voucherId,
            'voucher_discount' => $discount,
            'customer' => $request->customer,
            'address' => $request->address,
            'ward' => $request->ward,
            'district' => $request->district,
            'city' => $request->city,
            'phone' => $request->phone,
            'email' => $request->email,
            'rank_discount' => $request->rank_discount,
            'created_at' => now(),
            'updated_at' => now(),
        ]);


        // Thay đổi return URL để truyền thêm thông tin
        $returnUrl = config('vnpay.vnp_ReturnUrl') . '?' . http_build_query([

            'order_code' => $orderCode,

        ]);

        // Tạo URL thanh toán VNPAY (giữ nguyên)
        $vnp_TxnRef = $orderCode;
        $vnp_OrderInfo = 'Thanh toán đơn hàng ' . $orderCode;
        $vnp_Amount = (int)($finalAmount * 100);

        $vnp_Url = config('vnpay.vnp_Url');
        $vnp_TmnCode = config('vnpay.vnp_TmnCode');
        $vnp_HashSecret = config('vnpay.vnp_HashSecret');

        $inputData = [
            "vnp_Version" => "2.1.0",
            "vnp_TmnCode" => $vnp_TmnCode,
            "vnp_Amount" => $vnp_Amount,
            "vnp_Command" => "pay",
            "vnp_CreateDate" => now()->format('YmdHis'),
            "vnp_CurrCode" => "VND",
            "vnp_IpAddr" => $request->ip(),
            "vnp_Locale" => "vn",
            "vnp_OrderInfo" => $vnp_OrderInfo,
            "vnp_OrderType" => "billpayment",
            "vnp_ReturnUrl" => $returnUrl, // Sử dụng return URL mới
            "vnp_TxnRef" => $vnp_TxnRef,
        ];

        ksort($inputData);
        $query = "";
        $hashdata = "";
        foreach ($inputData as $key => $value) {
            $encodedKey = urlencode($key);
            $encodedValue = urlencode($value);
            $query .= $encodedKey . "=" . $encodedValue . "&";
            $hashdata .= $encodedKey . "=" . $encodedValue . "&";
        }

        $query = rtrim($query, "&");
        $hashdata = rtrim($hashdata, "&");
        $vnpSecureHash = hash_hmac('sha512', $hashdata, $vnp_HashSecret);
        $vnpUrl = $vnp_Url . "?" . $query . '&vnp_SecureHash=' . $vnpSecureHash;

        return response()->json([
            'payment_url' => $vnpUrl,
            'order_code' => $orderCode,
        ]);
    }

    public function handleReturn(Request $request)
    {
        // Thay đổi chính: Chỉ xử lý khi thanh toán thành công
        if ($request->input('vnp_ResponseCode') === '00') {
            // Lấy thông tin từ URL parameters

            $orderCode = $request->query('order_code');
            $pending = DB::table('pending_orders')->where('order_code', $orderCode)->first();

            if (!$pending) {
                return redirect()->away("http://localhost:5173/payment-failed?status=missing_order_data");
            }

            $user_id = $pending->user_id;
            $items = json_decode($pending->items, true);
            $totalAmount = $pending->total_amount;
            $voucherId = $pending->voucher_id;
            $discount = $pending->voucher_discount;

            // Kiểm tra xem đơn hàng với mã này đã tồn tại chưa
            $existingOrder = DB::table('orders')->where('order_code', $orderCode)->first();
            if ($existingOrder) {
                // Nếu đã tồn tại, trả về trang thank-you với thông tin đơn hàng hiện có
                return redirect()->away("http://localhost:5173/thank-you?order_id={$existingOrder->order_id}&status=success&order_code={$orderCode}");
            }

            // Tạo đơn hàng thực sự trong DB
            $orderId = DB::table('orders')->insertGetId([
                'user_id' => $user_id,
                'order_code' => $orderCode,
                'method_id' => 1,
                'total_amount' => $pending->total_amount + ($pending->paid_by_wallet ?? 0),
                'paid_by_wallet' => $pending->paid_by_wallet ?? 0,
                'paid_by_vnpay' => $pending->total_amount,
                'status' => 'Chờ xác nhận',
                'payment_status' => 'Đã thanh toán',
                'voucher_id' => $voucherId,
                'voucher_discount' => $discount,
                'address' => $pending->address,
                'ward' => $pending->ward,
                'district' => $pending->district,
                'city' => $pending->city,
                'phone' => $pending->phone,
                'email' => $pending->email,
                'customer' => $pending->customer,
                'rank_discount' => $pending->rank_discount,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

$wallet = DB::table('wallets')->where('user_id', $user_id)->first();
            // Thêm order items và trừ tồn kho
            foreach ($items as $item) {
                if (isset($item['variant_id'], $item['quantity'], $item['price_snapshot'])) {
                    $variant = DB::table('product_variants')
                        ->where('variant_id', $item['variant_id'])
                        ->first();

                    if ($variant) {
                        DB::table('order_items')->insert([
                            'order_id' => $orderId,
                            'product_id' => $variant->product_id,
                            'variant_id' => $item['variant_id'],
                            'quantity' => $item['quantity'],
                            'price' => $item['price_snapshot'],
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);

                        DB::table('product_variants')
                            ->where('variant_id', $item['variant_id'])
                            ->decrement('stock', $item['quantity']);
                    }
                }
            }

               // Trừ ví nếu có
        if ($pending->paid_by_wallet > 0 && $wallet) {
            DB::table('wallets')->where('wallet_id', $wallet->wallet_id)->decrement('balance', $pending->paid_by_wallet);
            DB::table('wallet_transactions')->insert([
                'wallet_id' => $wallet->wallet_id,
                'amount' => -$pending->paid_by_wallet,
                'type' => 'tiêu tiền',
                'note' => 'Thanh toán đơn hàng #' . $orderCode,
                'created_at' => now(),
            ]);
        }

            // Xử lý voucher sau khi tạo đơn hàng thành công
            if ($voucherId) {
                // Giảm số lượng voucher
                DB::table('vouchers')->where('voucher_id', $voucherId)->decrement('quantity');

                // Đánh dấu voucher đã sử dụng cho user
                DB::table('user_vouchers')
                    ->where('user_id', $user_id)
                    ->where('voucher_id', $voucherId)
                    ->update(['used_at' => now()]);
            }

            // Xóa giỏ hàng (giữ nguyên logic cũ)
            $cart = DB::table('carts')->where('user_id', $user_id)->first();
            if ($cart) {
                $paidVariantIds = array_column($items, 'variant_id');
                DB::table('cart_items')
                    ->where('cart_id', $cart->cart_id)
                    ->whereIn('variant_id', $paidVariantIds)
                    ->delete();
            }
            DB::table('pending_orders')->where('order_code', $orderCode)->delete();


            // Sửa: Đảm bảo lấy đầy đủ thông tin đơn hàng với payment_status đã cập nhật
            $updatedOrder = DB::table('orders')
                ->select('orders.*')
                ->where('orders.order_id', $orderId)
                ->first();

            // Kiểm tra và đảm bảo payment_status được gán đúng trong đối tượng
            if (!isset($updatedOrder->payment_status)) {
                $updatedOrder = (object) array_merge((array) $updatedOrder, ['payment_status' => 'Đã thanh toán']);
            }

            // Gửi email và thông báo (giữ nguyên)
            $user = DB::table('users')->where('user_id', $user_id)->first();
            if ($user) {
                Mail::to($updatedOrder->email)->send(new PaymentSuccessMail($updatedOrder, $user));
            }

            $admin = DB::table('users')->where('role', 'admin')->first();
            if ($admin) {
                DB::table('order_notifications')->insert([
                    'order_id' => $orderId,
                    'user_id' => $admin->user_id,
                    'type' => 'new_order',
                    'message' => 'Đơn hàng mới #' . $orderCode . ' vừa được tạo.',
                    'is_read' => 0,
                    'created_at' => now()
                ]);
            }

            return redirect()->away("http://localhost:5173/thank-you?order_id={$orderId}&status=success&order_code={$orderCode}");
        }

        // Nếu thanh toán thất bại, không cần làm gì cả
        return redirect()->away("http://localhost:5173/payment-failed?status=failed");
    }

    // Giữ nguyên hàm generateOrderCode()
    private function generateOrderCode()
    {
        $prefix = 'DH';
        $timestamp = now()->format('ymd');
        $randomStr = strtoupper(Str::random(4));
        $orderCount = DB::table('orders')
            ->whereDate('created_at', today())
            ->count();
        $sequence = str_pad($orderCount + 1, 4, '0', STR_PAD_LEFT);
        return $prefix . $timestamp . $sequence . $randomStr;
    }

    private function generateVnpayUrl($request, $orderCode, $finalAmount)
    {
        $vnp_TxnRef = $orderCode;
        $vnp_OrderInfo = 'Thanh toán đơn hàng ' . $orderCode;
        $vnp_Amount = (int)($finalAmount * 100);

        $vnp_Url = config('vnpay.vnp_Url');
        $vnp_TmnCode = config('vnpay.vnp_TmnCode');
        $vnp_HashSecret = config('vnpay.vnp_HashSecret');
        $returnUrl = config('vnpay.vnp_ReturnUrl') . '?order_code=' . $orderCode;

        $inputData = [
            "vnp_Version" => "2.1.0",
            "vnp_TmnCode" => $vnp_TmnCode,
            "vnp_Amount" => $vnp_Amount,
            "vnp_Command" => "pay",
            "vnp_CreateDate" => now()->format('YmdHis'),
            "vnp_CurrCode" => "VND",
            "vnp_IpAddr" => $request->ip(),
            "vnp_Locale" => "vn",
            "vnp_OrderInfo" => $vnp_OrderInfo,
            "vnp_OrderType" => "billpayment",
            "vnp_ReturnUrl" => $returnUrl,
            "vnp_TxnRef" => $vnp_TxnRef,
        ];

        ksort($inputData);
        $query = http_build_query($inputData);
        $hashdata = http_build_query($inputData);
        $vnpSecureHash = hash_hmac('sha512', $hashdata, $vnp_HashSecret);

        return $vnp_Url . "?" . $query . '&vnp_SecureHash=' . $vnpSecureHash;
    }
}
