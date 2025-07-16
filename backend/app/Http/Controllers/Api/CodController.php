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

        if (empty($items) || !is_array($items)) {
            return response()->json(['message' => 'Không có sản phẩm nào được chọn'], 400);
        }

        $cart = DB::table('carts')->where('user_id', $user->user_id)->first();
        if (!$cart) {
            return response()->json(['message' => 'Giỏ hàng không tồn tại'], 400);
        }

        foreach ($items as $item) {
            if (!is_array($item) || !isset($item['variant_id'], $item['quantity'], $item['price_snapshot'])) {
                return response()->json(['message' => 'Dữ liệu sản phẩm không hợp lệ'], 400);
            }
            $variant = DB::table('product_variants')->where('variant_id', $item['variant_id'])->first();
            if (!$variant || $variant->stock < $item['quantity']) {
                return response()->json([
                    'message' => 'Sản phẩm đã hết hàng hoặc không đủ số lượng',
                    'variant_id' => $item['variant_id']
                ], 400);
            }
        }

        DB::beginTransaction();
        try {
            $orderCode = $this->generateOrderCode();
            $orderId = DB::table('orders')->insertGetId([
                'user_id' => $user->user_id,
                'order_code' => $orderCode,
                'method_id' => 2,
                'total_amount' => 0, // sẽ cập nhật lại sau khi tính
                'status' => 'Chờ xác nhận',
                'payment_status' => 'Chưa thanh toán',
                'address' => $request->address,
                'ward' => $request->ward,
                'district' => $request->district,
                'city' => $request->city,
                'phone' => $request->phone,
                'email' => $request->email,
                'customer' => $request->customer,
                'voucher_id' => null,
                'voucher_discount' => 0,
                'rank_discount' => $request->rank_discount ?? 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $total = 0;
            $paidVariantIds = [];

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

                $total += $item['price_snapshot'] * $item['quantity'];

                DB::table('product_variants')->where('variant_id', $item['variant_id'])->decrement('stock', $item['quantity']);

                $paidVariantIds[] = $item['variant_id'];
            }

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
                    DB::table('vouchers')->where('voucher_id', $voucherId)->decrement('quantity');
                } else {
                    $voucherId = null; // không hợp lệ
                }
            }
            // ==============================

            DB::table('orders')->where('order_id', $orderId)->update([
                'total_amount' => max($total - $discount, 0),
                'voucher_id' => $voucherId,
                'voucher_discount' => $discount,
                'updated_at' => now(),
            ]);

            DB::table('cart_items')
                ->where('cart_id', $cart->cart_id)
                ->whereIn('variant_id', $paidVariantIds)
                ->delete();

            // Cập nhật used_at cho voucher nếu có
            if ($voucherId) {
                DB::table('user_vouchers')
                    ->where('user_id', $user->user_id)
                    ->where('voucher_id', $voucherId)
                    ->update(['used_at' => now()]);
            }


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
    // add voucher vào đơn hàng nhưngh chưa trừ tiền
    public function applyVoucher(Request $request)
    {
        $request->validate([
            'voucher_id' => 'required|integer',
            'items' => 'required|array|min:1',
        ]);

        // Tính tổng tiền từ items[]
        $totalAmount = 0;
        foreach ($request->items as $item) {
            if (!isset($item['variant_id'], $item['quantity'], $item['price_snapshot'])) {
                return response()->json(['message' => 'Dữ liệu sản phẩm không hợp lệ'], 400);
            }

            // Có thể kiểm tra thêm tồn kho nếu muốn
            $totalAmount += $item['price_snapshot'] * $item['quantity'];
        }

        $voucher = DB::table('vouchers')
            ->where('voucher_id', $request->voucher_id)
            ->where('is_active', 1)
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now())
            ->where('quantity', '>', 0)
            ->first();

        if (!$voucher) {
            return response()->json([
                'message' => 'Voucher không hợp lệ hoặc đã hết hạn/số lượng.'
            ], 404);
        }

        if ($totalAmount < $voucher->min_order_value) {
            return response()->json([
                'message' => 'Đơn hàng không đủ điều kiện sử dụng voucher.'
            ], 422);
        }

        return response()->json([
            'message' => 'Áp dụng voucher thành công',
            'voucher_id' => $voucher->voucher_id,
            'discount_amount' => $voucher->discount_amount,
            'total_amount' => $totalAmount,
            'new_total' => $totalAmount - $voucher->discount_amount
        ]);
    }
}
