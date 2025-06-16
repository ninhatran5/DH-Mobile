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
        // Lấy thông tin người dùng đang đăng nhập
        $user = Auth::user();

        // Lấy danh sách sản phẩm từ request
        $items = $request->input('items');
        if (empty($items) || !is_array($items)) {
            return response()->json(['message' => 'Không có sản phẩm nào được chọn'], 400);
        }

        // Kiểm tra từng sản phẩm xem hợp lệ và đủ tồn kho không
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

        // Bắt đầu transaction
        DB::beginTransaction();


        try {
            // Tạo mã đơn hàng
            $orderCode = $this->generateOrderCode();

            // Tạo đơn hàng mới
            $orderId = DB::table('orders')->insertGetId([
                'user_id' => $user->user_id,
                'order_code' => $orderCode,
                'method_id' => 2,
                'total_amount' => 0,
                'status' => 'Chờ xác nhận',
                'payment_status' => 'Chưa thanh toán',
                'voucher_id' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);


            // Lấy thông tin đơn hàng - sử dụng first() để lấy đối tượng
            $order = DB::table('orders')->where('order_id', $orderId)->first();
            $total = 0;

            // Lưu từng sản phẩm vào bảng order_items
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
                    continue; // Bỏ qua nếu không tìm thấy variant hoặc không lấy được product_id
                }

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
            }

            // cập nhật tổng tiền 
            DB::table('orders')->where('order_id', $orderId)->update([
                'total_amount' => $total,
                'updated_at' => now(),
            ]);


            // Lấy danh sách order items - sử dụng get() để lấy collection
            $orderItems = DB::table('order_items')
                ->where('order_id', $order->order_id)
                ->get();

            if ($orderItems->isNotEmpty()) {
                // Trừ tồn kho theo biến thể
                foreach ($orderItems as $item) {
                    // Đảm bảo $item là object trước khi truy cập thuộc tính
                    if (is_object($item) && isset($item->variant_id) && isset($item->quantity)) {
                        DB::table('product_variants')
                            ->where('variant_id', $item->variant_id)
                            ->decrement('stock', $item->quantity);
                    }
                }
            }

            // Xóa chỉ các sản phẩm đã thanh toán khỏi giỏ hàng
            $cart = DB::table('carts')->where('user_id', $order->user_id)->first();
            if ($cart && is_object($cart) && isset($cart->cart_id)) {
                // Lấy danh sách variant_id từ order_items
                $paidVariantIds = $orderItems->pluck('variant_id')->toArray();

                // Chỉ xóa các sản phẩm trong giỏ hàng có variant_id nằm trong danh sách đã thanh toán
                if (!empty($paidVariantIds)) {
                    DB::table('cart_items')
                        ->where('cart_id', $cart->cart_id)
                        ->whereIn('variant_id', $paidVariantIds)
                        ->delete();
                }
            }


            // Gửi email
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
            // return response()->json([
            //     'message' => 'Đặt hàng thất bại',
            //     'error' => $e->getMessage()
            // ], 500);
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

// bản tối ưu lại code 

// <?php

// namespace App\Http\Controllers\Api;

// use App\Http\Controllers\Controller;
// use Illuminate\Http\Request;
// use Illuminate\Support\Facades\Auth;
// use Illuminate\Support\Facades\DB;
// use Illuminate\Support\Facades\Mail;
// use App\Mail\CodPaymentSuccessMail;
// use Illuminate\Support\Str;

// class CodController extends Controller
// {
//     public function createCodOrder(Request $request)
//     {
//         $user = Auth::user();
//         $items = $request->input('items');

//         // Kiểm tra dữ liệu sản phẩm
//         if (empty($items) || !is_array($items)) {
//             return response()->json(['message' => 'Không có sản phẩm nào được chọn'], 400);
//         }

//         foreach ($items as $item) {
//             if (!isset($item['variant_id'], $item['quantity'])) {
//                 return response()->json(['message' => 'Dữ liệu sản phẩm không hợp lệ'], 400);
//             }

//             $variant = DB::table('product_variants')->where('variant_id', $item['variant_id'])->first();
//             if (!$variant || $variant->stock < $item['quantity']) {
//                 return response()->json([
//                     'message' => 'Sản phẩm đã hết hàng hoặc không đủ số lượng',
//                     'variant_id' => $item['variant_id']
//                 ], 400);
//             }
//         }

//         // Kiểm tra giỏ hàng
//         $cart = DB::table('carts')->where('user_id', $user->user_id)->first();
//         if (!$cart || DB::table('cart_items')->where('cart_id', $cart->cart_id)->doesntExist()) {
//             return response()->json(['message' => 'Giỏ hàng không tồn tại hoặc đang trống'], 400);
//         }

//         DB::beginTransaction();

//         try {
//             $orderCode = $this->generateOrderCode();
//             $orderId = DB::table('orders')->insertGetId([
//                 'user_id' => $user->user_id,
//                 'order_code' => $orderCode,
//                 'method_id' => 2,
//                 'total_amount' => 0,
//                 'status' => 'Chờ xác nhận',
//                 'payment_status' => 'Chưa thanh toán',
//                 'created_at' => now(),
//                 'updated_at' => now(),
//             ]);

//             $total = 0;
//             foreach ($items as $item) {
//                 if (!isset($item['price_snapshot'])) continue;

//                 $variant = DB::table('product_variants')->where('variant_id', $item['variant_id'])->first();
//                 if (!$variant) continue;

//                 DB::table('order_items')->insert([
//                     'order_id' => $orderId,
//                     'product_id' => $variant->product_id,
//                     'variant_id' => $item['variant_id'],
//                     'quantity' => $item['quantity'],
//                     'price' => $item['price_snapshot'],
//                     'created_at' => now(),
//                     'updated_at' => now(),
//                 ]);

//                 $total += $item['price_snapshot'] * $item['quantity'];
//             }

//             DB::table('orders')->where('order_id', $orderId)->update(['total_amount' => $total]);

//             // Trừ tồn kho
//             $orderItems = DB::table('order_items')->where('order_id', $orderId)->get();
//             foreach ($orderItems as $item) {
//                 DB::table('product_variants')->where('variant_id', $item->variant_id)->decrement('stock', $item->quantity);
//             }

//             // Xóa item trong giỏ hàng
//             $variantIds = $orderItems->pluck('variant_id')->toArray();
//             DB::table('cart_items')->where('cart_id', $cart->cart_id)->whereIn('variant_id', $variantIds)->delete();

//             // Gửi email
//             $order = DB::table('orders')->where('order_id', $orderId)->first();
//             $userData = DB::table('users')->where('user_id', $user->user_id)->first();
//             Mail::to($userData->email)->send(new CodPaymentSuccessMail($order, $userData));

//             DB::commit();

//             return response()->json([
//                 'message' => 'Đặt hàng thành công (COD)',
//                 'order_id' => $orderId,
//                 'order_code' => $orderCode
//             ]);
//         } catch (\Throwable $e) {
//             DB::rollBack();
//             return response()->json(['message' => 'Đặt hàng thất bại', 'error' => $e->getMessage()], 500);
//         }
//     }

//     private function generateOrderCode()
//     {
//         $prefix = 'DH';
//         $timestamp = now()->format('ymd');
//         $randomStr = strtoupper(Str::random(4));
//         $orderCount = DB::table('orders')->whereDate('created_at', today())->count();
//         $sequence = str_pad($orderCount + 1, 4, '0', STR_PAD_LEFT);

//         return $prefix . $timestamp . $sequence . $randomStr;
//     }
// }

