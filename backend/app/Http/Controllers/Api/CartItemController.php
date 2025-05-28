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
            'quantity' => $validated['quantity'] = $validated['quantity'] ?? 1,
        ]);

        return response()->json([
            'message' => 'Thêm thành công sản phẩm vào giỏ hàng',
            'cart_item' => $cartItem
        ], 201);
    }



    public function getCart(request $request)
    {

        $user = $request->user();
        if (!$user) {
            return response()->json([
                'message' => 'Chưa đăng nhập',
            ], 401);
        }

        $cart = Cart::where('user_id', $user->user_id)->first();

        if (!$cart) {
            return response()->json([
                'message' => 'Giỏ hàng không tồn tại',
            ], 404);
        }

        $cartItems = CartItem::where('cart_id', $cart->cart_id)
            ->with([
                'variant.product' => function ($query) {
                    $query->select('product_id', 'name');
                },
                'variant.variantAttributeValues.value.attribute'
            ])
            ->get();
        // Tính tổng tiền của giỏ hàng
        $totalAmount = $cartItems->sum(function ($item) {
            return $item->price_snapshot * $item->quantity;
        });

        // Format lại dữ liệu cart items
        $formattedCartItems = $cartItems->map(function ($item) {
            // Lấy và format attributes theo từng loại
            $storage = [];
            $color = [];
            $ram = [];
            
            foreach ($item->variant->variantAttributeValues as $attrValue) {
                $attributeName = $attrValue->value->attribute->name;
                $attributeValue = $attrValue->value->value;
                
                switch(strtolower($attributeName)) {
                    case 'storage':
                        $storage[] = $attributeValue;
                        break;
                    case 'color':
                        $color[] = $attributeValue;
                        break;
                    case 'ram':
                        $ram[] = $attributeValue;
                        break;
                }
            }

            return [
                'cart_item_id' => $item->cart_item_id,
                'product' => [
                    'name' => $item->variant->product->name,
                    'variant_id' => $item->variant->variant_id,
                    'storage' => $storage,
                    'color' => $color,
                    'ram' => $ram
                ],
                'quantity' => $item->quantity,
                'price' => $item->price_snapshot,
                'subtotal' => $item->price_snapshot * $item->quantity
            ];
        });

        return response()->json([
            'status' => true,
            'message' => $cartItems->count() > 0 ? 'Lấy giỏ hàng thành công' : 'Giỏ hàng không có sản phẩm',
            'data' => [
                'cart_id' => $cart->cart_id,
                'total_items' => $cartItems->count(),
                'total_amount' => $totalAmount,
                'items' => $formattedCartItems
            ]
        ], 200);
    }



    public function updateProductQuantity(request $request, $id)
    {
        // Kiểm tra đăng nhập
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'status' => false,
                'message' => 'Chưa đăng nhập'
            ], 401);
        }

        // Validate dữ liệu đầu vào
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1'
        ]);

        // Tìm giỏ hàng của người dùng
        $cart = Cart::where('user_id', $user->user_id)->first();
        if (!$cart) {
            return response()->json([
                'status' => false,
                'message' => 'Giỏ hàng không tồn tại'
            ], 404);
        }

        // Tìm sản phẩm trong giỏ hàng theo ID
        $cartItem = CartItem::where('cart_id', $cart->cart_id)
            ->where('variant_id', $id)
            ->first();

        if (!$cartItem) {
            return response()->json([
                'status' => false,
                'message' => 'Sản phẩm không có trong giỏ hàng'
            ], 404);
        }

        // Kiểm tra số lượng tồn kho
        $variant = ProductVariant::find($id);
        if ($variant->stock < $validated['quantity']) {
            return response()->json([
                'status' => false,
                'message' => 'Số lượng sản phẩm trong kho không đủ'
            ], 400);
        }

        // Cập nhật số lượng sản phẩm
        $cartItem->quantity = $validated['quantity'];
        $cartItem->save();

        return response()->json([
            'status' => true,
            'message' => 'Cập nhật số lượng sản phẩm thành công',
            'cart_item' => $cartItem
        ], 200);
    }


    public function removeProductFromCart(request $request, $id)
    {
        // Kiểm tra đăng nhập
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'status' => false,
                'message' => 'Chưa đăng nhập'
            ], 401);
        }

        // Tìm giỏ hàng của người dùng
        $cart = Cart::where('user_id', $user->user_id)->first();
        if (!$cart) {
            return response()->json([
                'status' => false,
                'message' => 'Giỏ hàng không tồn tại'
            ], 404);
        }

        // Tìm sản phẩm trong giỏ hàng theo ID
        $cartItem = CartItem::where('cart_id', $cart->cart_id)
            ->where('variant_id', $id)
            ->first();

        if (!$cartItem) {
            return response()->json([
                'status' => false,
                'message' => 'Sản phẩm không có trong giỏ hàng'
            ], 404);
        }

        // Xóa sản phẩm khỏi giỏ hàng
        $cartItem->delete();

        return response()->json([
            'status' => true,
            'message' => 'Xóa sản phẩm khỏi giỏ hàng thành công'
        ], 200);
    }

    public function clearCart(request $request)
    {
        // Kiểm tra đăng nhập
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'status' => false,
                'message' => 'Chưa đăng nhập'
            ], 401);
        }

        // Tìm giỏ hàng của người dùng
        $cart = Cart::where('user_id', $user->user_id)->first();
        if (!$cart) {
            return response()->json([
                'status' => false,
                'message' => 'Giỏ hàng không tồn tại'
            ], 404);
        }

        // Xóa tất cả sản phẩm trong giỏ hàng
        CartItem::where('cart_id', $cart->cart_id)->delete();

        return response()->json([
            'status' => true,
            'message' => 'Đã xóa tất cả sản phẩm trong giỏ hàng'
        ], 200);
    }
}
