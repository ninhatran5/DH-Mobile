<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Carbon\Carbon;

class VnpayController extends Controller
{
    public function createPayment(Request $request)
    {
        $user = Auth::user();

        $cart = DB::table('carts')->where('user_id', $user->user_id)->first();
        if (!$cart) return response()->json(['message' => 'Giỏ hàng rỗng'], 400);
        $cartItems = DB::table('cart_items')->where('cart_id', $cart->cart_id)->get();
        if ($cartItems->isEmpty()) return response()->json(['message' => 'Giỏ hàng trống'], 400);

        $orderId = DB::table('orders')->insertGetId([
            'user_id' => $user->user_id,
            'method_id' => 1, // VNPAY giả định
            'total_amount' => 0, // Sẽ cập nhật lại
            'status' => 'pending',
            'payment_status' => 'unpaid',
            'voucher_id' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $total = 0;
        foreach ($cartItems as $item) {
            DB::table('order_items')->insert([
                'order_id' => $orderId,
                'product_id' => DB::table('product_variants')->where('variant_id', $item->variant_id)->value('product_id'),
                'variant_id' => $item->variant_id,
                'quantity' => $item->quantity,
                'price' => $item->price_snapshot,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $total += $item->price_snapshot * $item->quantity;
        }

        // Cập nhật lại tổng tiền
        DB::table('orders')->where('order_id', $orderId)->update([
            'total_amount' => $total
        ]);

        // Tạo URL thanh toán VNPAY
        $vnp_TxnRef = Str::uuid();
        $vnp_OrderInfo = 'Thanh toán đơn hàng #' . $orderId;
        $vnp_Amount = $total * 100;

        $vnp_Url = config('vnpay.vnp_Url');
        $vnp_Returnurl = config('vnpay.vnp_ReturnUrl');
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
            "vnp_ReturnUrl" => $vnp_Returnurl . '?order_id=' . $orderId,
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

        return response()->json(['payment_url' => $vnpUrl]);
    }

    public function handleReturn(Request $request)
    {
        $orderId = $request->query('order_id');
        $responseCode = $request->input('vnp_ResponseCode');

        if ($responseCode == '00') {
            DB::table('orders')->where('order_id', $orderId)->update([
                'status' => 'paid',
                'payment_status' => 'paid',
                'updated_at' => now(),
            ]);
            return redirect()->away("http://localhost:5173/thank-you/payment-success?order_id={$orderId}&status=success");
        }

        return response()->json(['message' => 'Thanh toán thất bại'], 400);
    }
}
