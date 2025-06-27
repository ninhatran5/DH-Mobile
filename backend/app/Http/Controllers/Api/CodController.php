<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Mail\PaymentSuccessMail;
use Illuminate\Support\Str;

class CodController extends Controller
{
    public function createCodOrder(Request $request)
    {
        $user = Auth::user();
        $items = $request->input('items');
        $voucherId = $request->input('voucher_id');
        $voucher = null;
        $voucherDiscount = 0;

        // Validate địa chỉ
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
        ]);

        if (empty($items) || !is_array($items)) {
            return response()->json(['message' => 'Không có sản phẩm nào được chọn'], 400);
        }

        // Kiểm tra người dùng đã có giỏ hàng chưa
        $cart = DB::table('carts')->where('user_id', $user->user_id)->first();
        if (!$cart) {
            return response()->json(['message' => 'Giỏ hàng không tồn tại'], 400);
        }

        // Kiểm tra tồn kho và dữ liệu từng item
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
        }

        // Kiểm tra và áp dụng voucher nếu có
        if ($voucherId) {
            $voucher = DB::table('vouchers')
                ->where('voucher_id', $voucherId)
                ->where('is_active', 1)
                ->whereNull('deleted_at')
                ->where('start_date', '<=', now())
                ->where('end_date', '>=', now())
                ->first();
            if (!$voucher) {
                return response()->json(['message' => 'Voucher không hợp lệ hoặc đã hết hạn'], 400);
            }
            // Kiểm tra số lượng còn lại
            if ($voucher->quantity <= 0) {
                return response()->json(['message' => 'Voucher đã hết lượt sử dụng'], 400);
            }
            // Kiểm tra user đã dùng voucher này chưa
            $userVoucher = DB::table('user_vouchers')
                ->where('user_id', $user->user_id)
                ->where('voucher_id', $voucher->voucher_id)
                ->where('is_used', 1)
                ->first();
            if ($userVoucher) {
                return response()->json(['message' => 'Bạn đã sử dụng voucher này rồi'], 400);
            }
        } else {
            $voucherId = null;
        }

        DB::beginTransaction();
        try {
            $orderCode = $this->generateOrderCode();
            $orderId = DB::table('orders')->insertGetId([
                'user_id' => $user->user_id,
                'order_code' => $orderCode,
                'method_id' => 2,
                'total_amount' => 0,
                'status' => 'Chờ xác nhận',
                'payment_status' => 'Chưa thanh toán',
                'address' => $request->address,
                'ward' => $request->ward,
                'district' => $request->district,
                'city' => $request->city,
                'phone' => $request->phone,
                'email' => $request->email,
                'customer' => $request->customer,
                'voucher_id' => $voucherId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $total = 0;
            $paidVariantIds = [];
            foreach ($items as $item) {
                $variant = DB::table('product_variants')
                    ->where('variant_id', $item['variant_id'])
                    ->first();
                DB::table('order_items')->insert([
                    'order_id' => $orderId,
                    'product_id' => $variant->product_id,
                    'variant_id' => $item['variant_id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price_snapshot'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $total += $item['price_snapshot'] * $item['quantity'];
                DB::table('product_variants')
                    ->where('variant_id', $item['variant_id'])
                    ->decrement('stock', $item['quantity']);
                $paidVariantIds[] = $item['variant_id'];
            }

            // Áp dụng voucher nếu hợp lệ
            if ($voucher) {
                if ($total < $voucher->min_order_value) {
                    DB::rollBack();
                    return response()->json(['message' => 'Đơn hàng chưa đạt giá trị tối thiểu để sử dụng voucher'], 400);
                }
                $voucherDiscount = min($voucher->discount_amount, $total);
                $total -= $voucherDiscount;
                // Trừ số lượng voucher
                DB::table('vouchers')->where('voucher_id', $voucher->voucher_id)->decrement('quantity', 1);
                // Đánh dấu user đã dùng voucher
                DB::table('user_vouchers')->insert([
                    'user_id' => $user->user_id,
                    'voucher_id' => $voucher->voucher_id,
                    'is_used' => 1,
                    'used_at' => now(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            DB::table('orders')->where('order_id', $orderId)->update([
                'total_amount' => $total,
                'updated_at' => now(),
            ]);

            // Xóa các item đã mua khỏi giỏ hàng (chỉ xóa các item có variant_id đã đặt hàng)
            DB::table('cart_items')
                ->where('cart_id', $cart->cart_id)
                ->whereIn('variant_id', $paidVariantIds)
                ->delete();

            // Gửi email
            $order = DB::table('orders')->where('order_id', $orderId)->first();
            $userData = DB::table('users')->where('user_id', $user->user_id)->first();
            Mail::to($order->email)->send(new PaymentSuccessMail($order, $userData));

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

            DB::commit();

            return response()->json([
                'message' => 'Đặt hàng thành công (COD)',
                'order_id' => $orderId,
                'order_code' => $orderCode,
                'voucher_discount' => $voucherDiscount,
                'voucher_id' => $voucherId,
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Đặt hàng thất bại',
                'error' => $e->getMessage()
            ], 500);
        }
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
