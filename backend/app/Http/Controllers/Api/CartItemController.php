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
            'quantity' => $validated['quantity'] = $validated['quantity'] ?? 1,
            'price_snapshot' => $productVariant->price,
            'is_selected' => false,
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
            ->with(['variant.product','variant.attributeValues'])
            ->get();

        $totalPrice = $cartItems->where('is_selected', true)->sum(function ($item) {
            return $item->variant->price * $item->quantity;
        });

        $selectedCount = $cartItems->where('is_selected', true)->count();

        return response()->json([
            'message' => 'Lấy giỏ hàng thành công',
            'cart' => $cart,
            'cart_items' => $cartItems,
            'total_price' => $totalPrice,
            'selected_count' => $selectedCount
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

    public function toggleSelectCartItem(Request $request, $id)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'status' => false,
                'message' => 'Chưa đăng nhập'
            ], 401);
        }

        $cart = Cart::where('user_id', $user->user_id)->first();
        if (!$cart) {
            return response()->json([
                'status' => false,
                'message' => 'Giỏ hàng không tồn tại'
            ], 404);
        }

        $cartItem = CartItem::where('cart_id', $cart->cart_id)
            ->where('variant_id', $id)
            ->first();

        if (!$cartItem) {
            return response()->json([
                'status' => false,
                'message' => 'Sản phẩm không có trong giỏ hàng'
            ], 404);
        }

        $cartItem->is_selected = !$cartItem->is_selected;
        $cartItem->save();

        return response()->json([
            'status' => true,
            'message' => $cartItem->is_selected ? 'Đã chọn sản phẩm' : 'Đã bỏ chọn sản phẩm',
            'cart_item' => $cartItem
        ], 200);
    }

    public function selectAllCartItems(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'status' => false,
                'message' => 'Chưa đăng nhập'
            ], 401);
        }

        $cart = Cart::where('user_id', $user->user_id)->first();
        if (!$cart) {
            return response()->json([
                'status' => false,
                'message' => 'Giỏ hàng không tồn tại'
            ], 404);
        }

        CartItem::where('cart_id', $cart->cart_id)->update(['is_selected' => true]);

        return response()->json([
            'status' => true,
            'message' => 'Đã chọn tất cả sản phẩm trong giỏ hàng'
        ], 200);
    }

    public function unselectAllCartItems(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'status' => false,
                'message' => 'Chưa đăng nhập'
            ], 401);
        }

        $cart = Cart::where('user_id', $user->user_id)->first();
        if (!$cart) {
            return response()->json([
                'status' => false,
                'message' => 'Giỏ hàng không tồn tại'
            ], 404);
        }

        CartItem::where('cart_id', $cart->cart_id)->update(['is_selected' => false]);

        return response()->json([
            'status' => true,
            'message' => 'Đã bỏ chọn tất cả sản phẩm trong giỏ hàng'
        ], 200);
    }

    public function getSelectedItems(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'status' => false,
                'message' => 'Chưa đăng nhập'
            ], 401);
        }

        $cart = Cart::where('user_id', $user->user_id)->first();
        if (!$cart) {
            return response()->json([
                'status' => false,
                'message' => 'Giỏ hàng không tồn tại'
            ], 404);
        }

        $selectedItems = CartItem::where('cart_id', $cart->cart_id)
            ->where('is_selected', true)
            ->with(['variant.product', 'variant.attributeValues'])
            ->get();

        if ($selectedItems->isEmpty()) {
            return response()->json([
                'status' => false,
                'message' => 'Chưa có sản phẩm nào được chọn',
                'selected_items' => [],
                'total_price' => 0
            ], 200);
        }

        $totalPrice = $selectedItems->sum(function ($item) {
            return $item->variant->price * $item->quantity;
        });

        return response()->json([
            'status' => true,
            'message' => 'Lấy danh sách sản phẩm đã chọn thành công',
            'selected_items' => $selectedItems,
            'total_price' => $totalPrice
        ], 200);
    }
}
