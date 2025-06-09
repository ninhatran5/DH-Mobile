<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Orders;
use App\Models\OrderItems;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    //
    public function payCODOrder(Request $request)
    {
        // ✅ Kiểm tra dữ liệu đầu vào từ người dùng
        $request->validate([
            'customer_id' => 'required|integer', // Bắt buộc phải có mã khách hàng
            'items' => 'required|array',         // Bắt buộc phải có mảng sản phẩm
            'items.*.product_id' => 'required|integer', // Mỗi sản phẩm phải có ID
            'items.*.quantity' => 'required|integer|min:1', // Và số lượng phải >= 1
            'shipping_address' => 'required|string', // Địa chỉ giao hàng bắt buộc
        ]);

        // ✅ Bắt đầu transaction để đảm bảo tính toàn vẹn dữ liệu
        DB::beginTransaction();
        try {
            // 📝 Tạo đơn hàng mới với trạng thái mặc định "pending"
            $order = Orders::create([
                'customer_id' => $request->customer_id,
                'shipping_address' => $request->shipping_address,
                'payment_method' => 'COD', // COD = Cash On Delivery
                'status' => 'pending', // Trạng thái mặc định khi vừa đặt hàng
                'total_price' => 0,    // Tạm gán, sẽ tính tổng bên dưới
            ]);

            $total = 0; // Tổng tiền đơn hàng

            // 🧾 Duyệt qua từng sản phẩm được đặt trong đơn
            foreach ($request->items as $item) {
                // 🔖 Tạm thời gán giá cố định 100 (có thể thay bằng giá từ DB)
                // Ví dụ thật: $price = Product::find($item['product_id'])->price;
                $price = 100;

                // ➕ Lưu chi tiết sản phẩm vào bảng OrderItems
                OrderItems::create([
                    'order_id' => $order->id,            // Liên kết với đơn hàng vừa tạo
                    'product_id' => $item['product_id'], // Mã sản phẩm
                    'quantity' => $item['quantity'],     // Số lượng
                    'price' => $price,                   // Giá tại thời điểm đặt
                ]);

                // 💰 Cộng dồn tổng tiền
                $total += $price * $item['quantity'];
            }

            // 🧾 Cập nhật lại tổng giá trị đơn hàng
            $order->total_price = $total;
            $order->save(); // Lưu lại thay đổi

            // ✅ Xác nhận thành công và lưu vào database
            DB::commit();

            // 🔁 Trả phản hồi JSON cho client
            return response()->json([
                'message' => 'Đặt hàng COD thành công',
                'order' => $order
            ], 201);
        } catch (\Exception $e) {
            // ❌ Có lỗi xảy ra => rollback tất cả thay đổi
            DB::rollBack();

            // 🔁 Trả lỗi cho client
            return response()->json([
                'error' => 'Đặt hàng thất bại',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
