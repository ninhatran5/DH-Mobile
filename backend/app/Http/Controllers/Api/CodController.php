<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Orders;
use App\Models\OrderItems;
use App\Models\Product;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
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
                'status' => 'processing', // Trạng thái: đang xử lý
                'payment_status' => 'unpaid', // Chưa thanh toán
                'voucher_id' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Throwable $th) {
        }
    }
}
