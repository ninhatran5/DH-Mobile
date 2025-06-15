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

        $items = $request->input('items');
        if (empty($items) || !is_array($items)) {
            return response()->json(['message' => 'Không có sản phẩm nào được chọn'], 400);
        }

        // Kiểm tra tồn kho từng sản phẩm
        foreach ($items as $item) {
            // Kiểm tra item có cấu trúc hợp lệ không
            if (
                !is_array($item) ||
                !array_key_exists('variant_id', $item) ||
                !array_key_exists('quantity', $item)
            ) {
                return response()->json(['message' => 'Dữ liệu sản phẩm không hợp lệ'], 400);
            }

            $variant = DB::table('product_variants')
                ->where('variant_id', $item['variant_id'])
                ->first();

            if (!$variant || !is_object($variant) || !isset($variant->stock) || $variant->stock < $item['quantity']) {
                return response()->json([
                    'message' => 'Sản phẩm đã hết hàng hoặc không đủ số lượng',
                    'variant_id' => $item['variant_id']
                ], 400);
            }
        }

        // Tạo mã đơn hàng tạm thời để sử dụng trong thanh toán
        $orderCode = $this->generateOrderCode();

        // Tính tổng tiền
        $total = 0;
        $orderItems = [];

        foreach ($items as $item) {
            if (
                !is_array($item) ||
                !array_key_exists('variant_id', $item) ||
                !array_key_exists('quantity', $item) ||
                !array_key_exists('price_snapshot', $item)
            ) {
                continue;
            }

            $variant = DB::table('product_variants')->where('variant_id', $item['variant_id'])->first();
            if (!$variant || !is_object($variant) || !isset($variant->product_id)) {
                continue;
            }

            // Lưu thông tin sản phẩm vào session để tạo đơn hàng sau khi thanh toán thành công
            $orderItems[] = [
                'product_id' => $variant->product_id,
                'variant_id' => $item['variant_id'],
                'quantity' => $item['quantity'],
                'price' => $item['price_snapshot'],
            ];

            $total += $item['price_snapshot'] * $item['quantity'];
        }

        // Lưu thông tin đơn hàng vào session
        session([
            'pending_order' => [
                'user_id' => $user->user_id,
                'order_code' => $orderCode,
                'total_amount' => $total,
                'items' => $orderItems
            ]
        ]);

        // Tạo URL thanh toán VNPAY
        $vnp_TxnRef = $orderCode;
        $vnp_OrderInfo = 'Thanh toán đơn hàng ' . $orderCode;
        $vnp_Amount = (int)($total * 100);

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
            "vnp_ReturnUrl" => $vnp_Returnurl,
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
        $responseCode = $request->input('vnp_ResponseCode');
        $vnpTxnRef = $request->input('vnp_TxnRef'); // Mã đơn hàng từ VNPAY

        // Lấy thông tin đơn hàng từ session
        $pendingOrder = session('pending_order');

        if (!$pendingOrder || $pendingOrder['order_code'] !== $vnpTxnRef) {
            return redirect()->away("http://localhost:5173/payment-failed?status=failed&message=invalid_order");
        }

        // Xử lý thanh toán thành công
        if ($responseCode === '00') {
            $orderId = null;

            DB::transaction(function () use ($pendingOrder, &$orderId) {
                // Tạo đơn hàng mới
                $orderId = DB::table('orders')->insertGetId([
                    'user_id' => $pendingOrder['user_id'],
                    'order_code' => $pendingOrder['order_code'],
                    'method_id' => 1,
                    'total_amount' => $pendingOrder['total_amount'],
                    'status' => 'Chờ xác nhận',
                    'payment_status' => 'Đã thanh toán',
                    'voucher_id' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // Thêm các sản phẩm vào đơn hàng
                foreach ($pendingOrder['items'] as $item) {
                    DB::table('order_items')->insert([
                        'order_id' => $orderId,
                        'product_id' => $item['product_id'],
                        'variant_id' => $item['variant_id'],
                        'quantity' => $item['quantity'],
                        'price' => $item['price'],
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);

                    // Trừ tồn kho theo biến thể
                    DB::table('product_variants')
                        ->where('variant_id', $item['variant_id'])
                        ->decrement('stock', $item['quantity']);
                }

                // Xóa các sản phẩm đã thanh toán khỏi giỏ hàng
                $cart = DB::table('carts')->where('user_id', $pendingOrder['user_id'])->first();
                if ($cart && is_object($cart) && isset($cart->cart_id)) {
                    // Lấy danh sách variant_id từ order_items
                    $paidVariantIds = collect($pendingOrder['items'])->pluck('variant_id')->toArray();

                    // Chỉ xóa các sản phẩm trong giỏ hàng có variant_id nằm trong danh sách đã thanh toán
                    if (!empty($paidVariantIds)) {
                        DB::table('cart_items')
                            ->where('cart_id', $cart->cart_id)
                            ->whereIn('variant_id', $paidVariantIds)
                            ->delete();
                    }
                }

                // Gửi mail nếu có user
                $user = DB::table('users')->where('user_id', $pendingOrder['user_id'])->first();
                if ($user && is_object($user) && isset($user->email)) {
                    $order = DB::table('orders')->where('order_id', $orderId)->first();
                    Mail::to($user->email)->send(new PaymentSuccessMail($order, $user));
                }
            });

            // Xóa thông tin đơn hàng tạm thời khỏi session
            session()->forget('pending_order');

            return redirect()->away("http://localhost:5173/thank-you?order_id={$orderId}&status=success&order_code={$pendingOrder['order_code']}");
        }

        // Xóa thông tin đơn hàng tạm thời khỏi session
        session()->forget('pending_order');

        return redirect()->away("http://localhost:5173/payment-failed?status=failed&order_code={$pendingOrder['order_code']}");
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
