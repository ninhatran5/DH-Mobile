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

        // Chỉ lấy các sản phẩm đã được chọn
        $cartItems = DB::table('cart_items')
            ->where('cart_id', $cart->cart_id)
            ->where('is_selected', true)
            ->get();

        if ($cartItems->isEmpty()) {
            return response()->json([
                'message' => 'Vui lòng chọn sản phẩm để thanh toán'
            ], 400);
        }

        // Kiểm tra số lượng tồn kho của các sản phẩm được chọn
        foreach ($cartItems as $item) {
            $variant = DB::table('product_variants')
                ->where('variant_id', $item->variant_id)
                ->first();

            if (!$variant || $variant->stock < $item->quantity) {
                return response()->json([
                    'message' => 'Sản phẩm đã hết hàng hoặc không đủ số lượng',
                    'variant_id' => $item->variant_id
                ], 400);
            }
        }

        // Tạo mã đơn hàng
        $orderCode = $this->generateOrderCode();

        $orderId = DB::table('orders')->insertGetId([
            'user_id' => $user->user_id,
            'order_code' => $orderCode,
            'method_id' => 1, // VNPAY giả định
            'total_amount' => 0, // Sẽ cập nhật lại
            'status' => 'Đang chờ',
            'payment_status' => 'Chưa thanh toán',
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

        // Cập nhật lại tổng tiền - đảm bảo giá trị nằm trong phạm vi cho phép
        DB::table('orders')->where('order_id', $orderId)->update([
            'total_amount' => $total
        ]);

        // Tạo URL thanh toán VNPAY
        $vnp_TxnRef = $orderCode; // Sử dụng order_code làm mã giao dịch
        $vnp_OrderInfo = 'Thanh toán đơn hàng ' . $orderCode;
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

        return response()->json([
            'payment_url' => $vnpUrl,
            'order_code' => $orderCode
        ]);
    }

    public function handleReturn(Request $request)
    {
        $orderId = $request->query('order_id');
        $responseCode = $request->input('vnp_ResponseCode');

        // Lấy thông tin đơn hàng trước khi xử lý
        $order = DB::table('orders')->where('order_id', $orderId)->first();
        if (!$order) {
            return redirect()->away("http://localhost:5173/payment-failed?status=failed&message=order_not_found");
        }

        if ($responseCode == '00') {
            // Cập nhật trạng thái đơn hàng trước
            DB::table('orders')->where('order_id', $orderId)->update([
                'status' => 'Đã thanh toán',
                'payment_status' => 'Đã thanh toán',
                'updated_at' => now(),
            ]);

            // Trừ số lượng biến thể sản phẩm trong đơn hàng
            $orderItems = DB::table('order_items')->where('order_id', $orderId)->get();

            foreach ($orderItems as $item) {
                DB::table('product_variants')
                    ->where('variant_id', $item->variant_id)
                    ->decrement('stock', $item->quantity);
            }

            // Lấy thông tin người dùng
            $user = DB::table('users')->where('user_id', $order->user_id)->first();

            Mail::to($user->email)->send(new PaymentSuccessMail($order, $user));

            // Chỉ xóa các sản phẩm đã chọn khỏi giỏ hàng
            $cart = DB::table('carts')->where('user_id', $order->user_id)->first();
            if ($cart) {
                DB::table('cart_items')
                    ->where('cart_id', $cart->cart_id)
                    ->where('is_selected', true)
                    ->delete();
            }
            return redirect()->away("http://localhost:5173/thank-you?order_id={$orderId}&status=success&order_code={$order->order_code}");
        }

        // Nếu thanh toán thất bại, xóa đơn hàng và order items
        DB::transaction(function () use ($orderId) {
            // Xóa order items trước vì có khóa ngoại
            DB::table('order_items')->where('order_id', $orderId)->delete();
            // Sau đó xóa order
            DB::table('orders')->where('order_id', $orderId)->delete();
        });

        return redirect()->away("http://localhost:5173/payment-failed?order_id={$orderId}&status=failed&order_code={$order->order_code}");
    }

    private function generateOrderCode()
    {
        $prefix = 'DH'; // Prefix cho mã đơn hàng (DH = Đơn Hàng)
        $timestamp = now()->format('ymd'); // Format: YYMMDD
        $randomStr = strtoupper(Str::random(4)); // 4 ký tự ngẫu nhiên

        // Đếm số đơn hàng trong ngày để tạo số thứ tự
        $orderCount = DB::table('orders')
            ->whereDate('created_at', today())
            ->count();
        $sequence = str_pad($orderCount + 1, 4, '0', STR_PAD_LEFT); // Số thứ tự 4 chữ số

        return $prefix . $timestamp . $sequence . $randomStr;
    }
}
