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
        // 1. Validate dữ liệu đầu vào
        $request->validate([
            'items' => 'required|array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'address' => 'required|string|max:255',
            'note' => 'nullable|string|max:255',
        ]);

        $user = $request->user();
        $items = $request->items;

        DB::beginTransaction();

        try {
            $totalAmount = 0;
            // 2. Kiểm tra tồn kho & tính tổng tiền
            foreach ($items as $item) {
                $product = Product::findOrFail($item['product_id']);

                // ⚠️ Kiểm tra tồn kho
                if ($product->stock < $item['quantity']) {
                    throw new \Exception("Sản phẩm '{$product->name}' không đủ hàng. Chỉ còn {$product->stock} sản phẩm.");
                }

                $totalAmount += $product->price * $item['quantity'];
            }
            // 3. Tạo đơn hàng 
            $order = Orders::create([
                'user_id' => $user->id,
                'total_amount' => $totalAmount,
                'address' => $request->address,
                'note' => $request->note,
                'payment_method' => 'COD',
                'status' => 'pending',
            ]);
            // 4. Tạo chi tiết đơn hàng 
            foreach ($items as $item) {
                $product = Product::findOrFail($item['product_id']);

                OrderItems::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'price' => $product->price,
                ]);
            }
        } catch (\Throwable $th) {
            DB::rollBack();

            return response()->json([
                'message' => 'Đặt hàng thất bại',
                'error' => $th->getMessage(),
            ], 500);
        }
    }
}
