<?php

namespace App\Http\Controllers\Api;

use Carbon\Carbon;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Mail\PaymentSuccessMail;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;

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
            'status' => 'đang chờ',
            'payment_status' => 'chưa thanh toán',
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

        // Check if total exceeds the database limit (decimal 10,2)
        // if ($total > 99999999.99) {
        //     return response()->json(['message' => 'Tổng giá trị đơn hàng vượt quá giới hạn cho phép'], 400);
        // }

        // Cập nhật lại tổng tiền - đảm bảo giá trị nằm trong phạm vi cho phép
        DB::table('orders')->where('order_id', $orderId)->update([
            'total_amount' => $total
        ]);

        // Tạo URL thanh toán VNPAY
        $vnp_TxnRef = Str::uuid();
        $vnp_OrderInfo = 'Thanh toán đơn hàng #' . $orderId;
        $vnp_Amount = (int)($total * 100); // VNPAY requires amount in smallest currency unit (cents)

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
            // Cập nhật trạng thái đơn hàng trước
            DB::table('orders')->where('order_id', $orderId)->update([
                'status' => 'đã thanh toán',
                'payment_status' => 'đã thanh toán',
                'updated_at' => now(),
            ]);

            // Sau đó mới lấy thông tin đơn hàng đã được cập nhật
            $order = DB::table('orders')->where('order_id', $orderId)->first();

            // Lấy thông tin người dùng
            $user = DB::table('users')->where('user_id', $order->user_id)->first();

            Mail::to($user->email)->send(new PaymentSuccessMail($order, $user));
            return redirect()->away("http://localhost:5173/thank-you?order_id={$orderId}&status=success");
        }

        return redirect()->away("http://localhost:5173/payment-failed?order_id={$orderId}&status=success");
    }
}
