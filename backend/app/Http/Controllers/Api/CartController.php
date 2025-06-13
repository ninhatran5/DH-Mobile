<?php

namespace App\Http\Controllers\Api;

use App\Models\Cart;
use App\Models\CartItem;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class CartController extends Controller
{
  public function Cart(Request $request)
{
    $user = $request->user();
    if (!$user) {
        return response()->json([
            'status' => false,
            'message' => 'Người dùng không tồn tại'
        ], 401);
    }

    // Tự động tạo giỏ hàng nếu chưa có
    $cart = Cart::firstOrCreate(['user_id' => $user->user_id]);

    // Lấy danh sách sản phẩm trong giỏ hàng
    $cartItems = CartItem::where('cart_id', $cart->cart_id)
        ->with(['variant.product', 'variant.attributeValues']) // load quan hệ
        ->get();

    $totalPrice = $cartItems->sum(function ($item) {
        return $item->variant->price * $item->quantity;
    });

    return response()->json([
        'status' => true,
        'message' => 'Chào mừng bạn đến giỏ hàng',
        'cart' => $cart,
        'cart_items' => $cartItems,
        'total_price' => $totalPrice,
    ]);
}

}
