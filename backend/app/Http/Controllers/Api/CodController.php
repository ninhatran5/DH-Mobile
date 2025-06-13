<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Mail\PaymentSuccessMail;

class CodController extends Controller
{
    //
    public function createCodOrder(Request $request)
    {
        // Lấy thông tin người dùng đang đăng nhập
        $user = Auth::user();

        // Tìm giỏ hàng tương ứng với người dùng
        $cart = DB::table('carts')->where('user_id', $user->user_id)->first();
        if (!$cart) return response()->json(['message' => 'Giỏ hàng rỗng'], 400);

        // Lấy danh sách các sản phẩm trong giỏ hàng
        $cartItems = DB::table('cart_items')->where('cart_id', $cart->cart_id)->get();
        if ($cartItems->isEmpty()) return response()->json(['message' => 'Giỏ hàng trống'], 400);

        // Bắt đầu transaction để đảm bảo tính toàn vẹn dữ liệu
        DB::beginTransaction();

        try {
            // Tạo đơn hàng mới với phương thức COD (method_id = 2)
            $orderId = DB::table('orders')->insertGetId([
                'user_id' => $user->user_id,
                'method_id' => 2, // 2 = COD
                'total_amount' => 0, // Tổng tiền sẽ được cập nhật sau
                'status' => 'chờ xử lý', // Trạng thái: đang xử lý
                'payment_status' => 'chưa thanh toán', // Chưa thanh toán
                'voucher_id' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $total = 0; // Biến tính tổng tiền đơn hàng

            // Lặp qua từng sản phẩm trong giỏ hàng
            foreach ($cartItems as $item) {
                // Lấy product_id tương ứng với variant_id
                $productId = DB::table('product_variants')
                    ->where('variant_id', $item->variant_id)
                    ->value('product_id');

                // Thêm từng sản phẩm vào bảng order_items
                DB::table('order_items')->insert([
                    'order_id' => $orderId,
                    'product_id' => $productId,
                    'variant_id' => $item->variant_id,
                    'quantity' => $item->quantity,
                    'price' => $item->price_snapshot, // giá tại thời điểm đặt hàng
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // Cộng dồn tổng tiền của đơn hàng
                $total += $item->price_snapshot * $item->quantity;
            }

            // Kiểm tra giới hạn kiểu decimal(10,2) ~ tối đa 99,999,999.99
            // if ($total > 99999999.99) {
            //     DB::rollBack(); // Hủy transaction
            //     return response()->json(['message' => 'Tổng đơn vượt quá giới hạn'], 400);
            // }

            // Cập nhật lại tổng tiền đơn hàng sau khi tính xong
            DB::table('orders')->where('order_id', $orderId)->update([
                'total_amount' => $total,
            ]);

            // Xoá toàn bộ sản phẩm trong giỏ hàng (sau khi đã đặt đơn)
            DB::table('cart_items')->where('cart_id', $cart->cart_id)->delete();

            // // Gửi email xác nhận đơn hàng
            // $order = DB::table('orders')->where('order_id', $orderId)->first();
            // $userData = DB::table('users')->where('user_id', $user->user_id)->first();
            // Mail::to($userData->email)->send(new PaymentSuccessMail($order, $userData));

            // Commit dữ liệu - lưu thay đổi vào database
            DB::commit();

            // Trả về JSON phản hồi thành công
            return response()->json([
                'message' => 'Đặt hàng thành công. Thanh toán khi nhận hàng.',
                'order_id' => $orderId,
            ]);
        } catch (\Throwable $th) {
            // Nếu có lỗi trong quá trình xử lý, rollback lại toàn bộ
            DB::rollBack();
            return response()->json(['message' => 'Đặt hàng thất bại', 'error' => $th->getMessage()], 500);
        }
    }
}
