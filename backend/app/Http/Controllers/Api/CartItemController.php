<?php

namespace App\Http\Controllers\Api;

use App\Models\Cart;
use App\Models\CartItem;
use Illuminate\Http\Request;
use App\Models\ProductVariant;
use App\Http\Controllers\Controller;

class CartItemController extends Controller
{
    //

    public function addProductToCart(request $request, $id)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'message' => 'Chưa đăng nhập',
            ], 401);
        }

        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $productVariant = $productVariant = ProductVariant::find($id);

        if (!$productVariant) {
            return response()->json([
                'message' => 'Biến thể sản phẩm không tồn tại'
            ], 404);
        }
        // Kiểm tra xem biến thể sản phẩm có còn hàng không
        if ($productVariant->stock <= 0) {
            return response()->json([
                'message' => 'Biến thể sản phẩm đã hết hàng'
            ], 400);
        }

        if ($productVariant->stock < $validated['quantity']) {
            return response()->json([
                'message' => 'Số lượng sản phẩm không đủ'
            ], 400);
        }



        // Kiểm tra xem người dùng đã có giỏ hàng chưa
        $cart = Cart::firstOrCreate(   // Tự động tạo giỏ hàng nếu chưa có
            ['user_id' => $user->user_id]
        );
        if ($cart->cart_id) {
            // Nếu giỏ hàng đã tồn tại, kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
            $existingCartItem = CartItem::where('cart_id', $cart->cart_id)
                ->where('variant_id', $productVariant->variant_id)
                ->first();

            if ($existingCartItem) {
                // Nếu sản phẩm đã có trong giỏ hàng, cập nhật số lượng
                $existingCartItem->quantity += $validated['quantity'];
                $existingCartItem->save();

                return response()->json([
                    'message' => 'Sản phẩm đã được cập nhật trong giỏ hàng',
                    'cart_item' => $existingCartItem
                ], 200);
            }
        }

        $cartItem = CartItem::create([
            'cart_id' => $cart->cart_id,
            'variant_id' => $productVariant->variant_id,
            'price_snapshot' => $productVariant->price,
            'quantity' => $validated['quantity'],
        ]);

        return response()->json([
            'message' => 'Product added to cart successfully',
            'cart_item' => $cartItem
        ], 201);
    }



    public function  getCart(request $request) {

        $user = $request->user();
        if (!$user) {
            return response()->json([
                'message' => 'Chưa đăng nhập',
            ], 401);
        }

        // Lấy giỏ hàng của người dùng
        $cart = Cart::where('user_id', $user->user_id)->first();

        if (!$cart) {
            return response()->json([
                'message' => 'Giỏ hàng không tồn tại',
            ], 404);
        }

        // Lấy tất cả các sản phẩm trong giỏ hàng
        $cartItems = CartItem::where('cart_id', $cart->cart_id)
            ->with('variant') // Tải thông tin biến thể sản phẩm
            ->get();

        return response()->json([
            'message' => 'Lấy giỏ hàng thành công',
            'cart_items' => $cartItems
        ], 200);
    }
}
