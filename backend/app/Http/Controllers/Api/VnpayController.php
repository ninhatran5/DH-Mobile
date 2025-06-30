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
use App\Models\Order;

class VnpayController extends Controller
{
    public function createPayment(Request $request)
    {
        $user = Auth::user();
        $items = $request->input('items');

        // Validate dữ liệu (giữ nguyên như cũ)
        if (empty($items) || !is_array($items)) {
            return response()->json(['message' => 'Không có sản phẩm nào được chọn'], 400);
        }

        // Kiểm tra tồn kho (giữ nguyên)
        foreach ($items as $item) {
            if (!is_array($item) || !isset($item['variant_id'], $item['quantity'])) {
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
        }


        // Chỉ tính toán thông tin cần thiết
        $orderCode = $this->generateOrderCode();

        $total = 0;
        foreach ($items as $item) {
            if (isset($item['price_snapshot'])) {
                $total += $item['price_snapshot'] * $item['quantity'];
            }
        }

        DB::table('pending_orders')->insert([
            'order_code' => $orderCode,
            'user_id' => $user->user_id,
            'items' => json_encode($items),
            'total_amount' => $total,
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


        // Thay đổi return URL để truyền thêm thông tin
        $returnUrl = config('vnpay.vnp_ReturnUrl') . '?' . http_build_query([

            'order_code' => $orderCode,

        ]);

        // Tạo URL thanh toán VNPAY (giữ nguyên)
        $vnp_TxnRef = $orderCode;
        $vnp_OrderInfo = 'Thanh toán đơn hàng ' . $orderCode;
        $vnp_Amount = (int)($total * 100);

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
                'total_amount' => $totalAmount,
                'status' => 'Chờ xác nhận',
                'payment_status' => 'Đã thanh toán',
                'voucher_id' => null,
                'address' => $pending->address,
                'ward' => $pending->ward,
                'district' => $pending->district,
                'city' => $pending->city,
                'phone' => $pending->phone,
                'email' => $pending->email,
                'customer' => $pending->customer,
                'created_at' => now(),
                'updated_at' => now(),
            ]);


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
}
