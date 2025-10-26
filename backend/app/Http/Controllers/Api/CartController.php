<?php

namespace App\Http\Controllers\Api;

use App\Models\Cart;
use App\Models\CartItem;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class CartController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/cart",
     *     summary="Lấy thông tin giỏ hàng của người dùng",
     *     description="Trả về giỏ hàng hiện tại bao gồm danh sách sản phẩm, tổng tiền, thông tin biến thể,... Nếu người dùng chưa có giỏ hàng, hệ thống sẽ tự động tạo mới.",
     *     tags={"Cart"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Lấy giỏ hàng thành công",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Chào mừng bạn đến giỏ hàng"),
     *             @OA\Property(property="cart", type="object",
     *                 @OA\Property(property="cart_id", type="integer", example=1),
     *                 @OA\Property(property="user_id", type="integer", example=10),
     *                 @OA\Property(property="created_at", type="string", format="date-time"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time")
     *             ),
     *             @OA\Property(property="cart_items", type="array",
     *                 @OA\Items(
     *                     @OA\Property(property="cart_item_id", type="integer", example=5),
     *                     @OA\Property(property="variant", type="object",
     *                         @OA\Property(property="variant_id", type="integer", example=3),
     *                         @OA\Property(property="price", type="number", format="float", example=1990000),
     *                         @OA\Property(property="product", type="object",
     *                             @OA\Property(property="product_id", type="integer", example=1),
     *                             @OA\Property(property="name", type="string", example="iPhone 13")
     *                         ),
     *                         @OA\Property(property="attributeValues", type="array",
     *                             @OA\Items(
     *                                 @OA\Property(property="attribute_name", type="string", example="Màu sắc"),
     *                                 @OA\Property(property="value", type="string", example="Đỏ")
     *                             )
     *                         )
     *                     ),
     *                     @OA\Property(property="quantity", type="integer", example=2)
     *                 )
     *             ),
     *             @OA\Property(property="total_price", type="number", format="float", example=3980000)
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Người dùng chưa đăng nhập hoặc token không hợp lệ",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Người dùng không tồn tại")
     *         )
     *     )
     * )
     */

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
