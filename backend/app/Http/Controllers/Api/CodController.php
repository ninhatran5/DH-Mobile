<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Mail\CodPaymentSuccessMail;
use Illuminate\Support\Str;

class CodController extends Controller
{
    public function createCodOrder(Request $request)
    {
        $user = Auth::user();

        // Kiểm tra người dùng đã có giỏ hàng chưa
        $cart = DB::table('carts')->where('user_id', $user->user_id)->first();
        if (!$cart) {
            return response()->json(['message' => 'Giỏ hàng không tồn tại'], 400);
        }

        // Lấy các sản phẩm trong giỏ
        $cartItems = DB::table('cart_items')->where('cart_id', $cart->cart_id)->get();
        if ($cartItems->isEmpty()) {
            return response()->json(['message' => 'Giỏ hàng đang trống'], 400);
        }

        DB::beginTransaction();

        try {
            // Tạo mã đơn hàng
            $orderCode = $this->generateOrderCode();

            // Tạo đơn hàng
            $orderId = DB::table('orders')->insertGetId([
                'user_id' => $user->user_id,
                'order_code' => $orderCode,
                'method_id' => 2, // COD
                'total_amount' => 0, // Sẽ cập nhật sau
                'status' => 'Chờ xác nhận',
                'payment_status' => 'Chưa thanh toán',
                'voucher_id' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $total = 0;

            foreach ($cartItems as $item) {
                $variant = DB::table('product_variants')
                    ->where('variant_id', $item->variant_id)
                    ->first();

                if (!$variant || $variant->stock < $item->quantity) {
                    DB::rollBack();
                    return response()->json([
                        'message' => 'Sản phẩm đã hết hàng hoặc không đủ số lượng',
                        'variant_id' => $item->variant_id
                    ], 400);
                }

                // Thêm vào order_items
                DB::table('order_items')->insert([
                    'order_id' => $orderId,
                    'product_id' => $variant->product_id,
                    'variant_id' => $item->variant_id,
                    'quantity' => $item->quantity,
                    'price' => $item->price_snapshot,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // Tính tổng tiền
                $total += $item->price_snapshot * $item->quantity;

                // Trừ tồn kho
                DB::table('product_variants')
                    ->where('variant_id', $item->variant_id)
                    ->decrement('stock', $item->quantity);
            }

            // Cập nhật lại tổng tiền
            DB::table('orders')->where('order_id', $orderId)->update([
                'total_amount' => $total,
                'updated_at' => now(),
            ]);

            // Xoá giỏ hàng sau khi đặt
            DB::table('cart_items')->where('cart_id', $cart->cart_id)->delete();

            //  Gửi email xác nhận
            $order = DB::table('orders')->where('order_id', $orderId)->first();
            $userData = DB::table('users')->where('user_id', $user->user_id)->first();
            Mail::to($userData->email)->send(new CodPaymentSuccessMail($order, $userData));

            DB::commit();

            return response()->json([
                'message' => 'Đặt hàng thành công (COD)',
                'order_id' => $orderId,
                'order_code' => $orderCode
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Đặt hàng thất bại',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Hàm tạo mã đơn hàng duy nhất
    private function generateOrderCode()
    {
        $prefix = 'DH';
        $timestamp = now()->format('ymd'); // YYMMDD
        $randomStr = strtoupper(Str::random(4));
        $orderCount = DB::table('orders')
            ->whereDate('created_at', today())
            ->count();
        $sequence = str_pad($orderCount + 1, 4, '0', STR_PAD_LEFT);

        return $prefix . $timestamp . $sequence . $randomStr;
    }
}
