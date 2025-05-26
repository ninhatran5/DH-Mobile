<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Cart;

class CartController extends Controller
{
    public function Cart(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'status' => false,
                'message' => 'Người dùng không tồn tại'
            ], 401); // 401: Unauthorized
        }
        // Tự động tạo giỏ hàng nếu chưa có
        $cart = Cart::firstOrCreate(
            ['user_id' => $user->user_id]
        );

        return response()->json([
            'status' => true,
            'message' => 'Chào mừng bạn đến giỏ hàng',
            'data' => $cart
        ]);
    }
}
