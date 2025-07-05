<?php

namespace App\Http\Controllers\Api;

use App\Models\Comment;
use Illuminate\Http\Request;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;

class CommentController extends Controller
{
    public function index($id)
    {
        $comments = Comment::with([
            'user.tier',
            'user',
            'product',
            'repliedBy',
            'variant.variantAttributeValues.value.attribute'
        ])
            ->where('product_id', $id)
            ->orderBy('created_at', 'desc')
            ->get();
        $comments = $comments->map(function ($comment) {
            $arr = $comment->toArray();

            // Gộp thông tin tier của user nếu có
            if ($comment->user && $comment->user->tier) {
                $arr['user']['tier'] = [
                    'name' => $comment->user->tier->name,
                    'image_url' => $comment->user->tier->image_url,
                ];
            } else {
                $arr['user']['tier'] = null;
            }
// dd($comment->user->tier);

            // Tối ưu variant chỉ lấy trường chính
            if ($comment->variant) {
                $arr['variant'] = [
                    'variant_id' => $comment->variant->variant_id,
                    'sku' => $comment->variant->sku,
                    'image_url' => $comment->variant->image_url,
                    'price' => $comment->variant->price,
                    'price_original' => $comment->variant->price_original
                ];
                $arr['variant_attributes'] = $comment->variant->variantAttributeValues->map(function ($attrValue) {
                    return [
                        'attribute_name' => $attrValue->value->attribute->name,
                        'attribute_value' => $attrValue->value->value
                    ];
                });
            } else {
                $arr['variant'] = null;
                $arr['variant_attributes'] = [];
            }
            // Xoá trường variant_attribute_values nếu có
            if (isset($arr['variant']['variant_attribute_values'])) {
                unset($arr['variant']['variant_attribute_values']);
            }
            return $arr;
        });
        return response()->json([
            'status' => true,
            'message' => 'Đánh giá sản phẩm',
            'data' => $comments
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'variant_id' => 'required|integer|exists:product_variants,variant_id',
            'rating' => 'required|integer|min:1|max:5',
            'content' => 'nullable|string|max:1000',
        ]);

        $user = $request->user();
        $variantId = $request->variant_id;
        // Lấy product_id từ variant_id
        $variant = ProductVariant::find($variantId);
        if (!$variant) {
            return response()->json([
                'status' => false,
                'message' => 'Biến thể sản phẩm không tồn tại.',
            ], 404);
        }
        $productId = $variant->product_id;

        // Kiểm tra user đã mua đúng biến thể này chưa và đơn hàng đã hoàn thành chưa
        $hasPurchased = DB::table('orders')
            ->join('order_items', 'orders.order_id', '=', 'order_items.order_id')
            ->where('orders.user_id', $user->user_id)
            ->where('orders.status', 'Hoàn thành')
            ->where('order_items.variant_id', $variantId)
            ->exists();

        if (!$hasPurchased) {
            return response()->json([
                'status' => false,
                'message' => 'Bạn chỉ có thể đánh giá đúng biến thể sản phẩm đã mua và đã hoàn thành.',
            ], 403);
        }

        // Nếu đã từng đánh giá biến thể này rồi -> cập nhật
        $comment = Comment::updateOrCreate(
            [
                'user_id' => $user->user_id,
                'variant_id' => $variantId,
                'product_id' => $productId
            ],
            [
                'rating' => $request->rating,
                'content' => $request->content
            ]
        );

        return response()->json([
            'status' => true,
            'message' => 'Đánh giá của bạn đã được lưu.',
            'data' => $comment
        ]);
    }


    public function getAllComments()
    {
        $comments = Comment::with([
            'user',
            'product',
            'variant.variantAttributeValues.value.attribute'
        ])
            ->orderBy('created_at', 'desc')
            ->get();

        if ($comments->isEmpty()) {
            return response()->json([
                'message' => 'Chưa có đánh giá nào',
            ]);
        }
        $comments = $comments->map(function ($comment) {
            $arr = $comment->toArray();
            if ($comment->variant) {
                $arr['variant'] = [
                    'variant_id' => $comment->variant->variant_id,
                    'sku' => $comment->variant->sku,
                    'image_url' => $comment->variant->image_url,
                    'price' => $comment->variant->price,
                    'price_original' => $comment->variant->price_original
                ];
                $arr['variant_attributes'] = $comment->variant->variantAttributeValues->map(function ($attrValue) {
                    return [
                        'attribute_name' => $attrValue->value->attribute->name,
                        'attribute_value' => $attrValue->value->value
                    ];
                });
            } else {
                $arr['variant'] = null;
                $arr['variant_attributes'] = [];
            }
            if (isset($arr['variant']['variant_attribute_values'])) {
                unset($arr['variant']['variant_attribute_values']);
            }
            return $arr;
        });
        return response()->json([
            'status' => true,
            'message' => 'Danh sách tất cả đánh giá',
            'data' => $comments
        ]);
    }

    public function relyComments(Request $request, $id)
    {
        $request->validate([
            'reply' => 'required|string|max:1000',
        ]);

        $comment = Comment::find($id);
        if (!$comment) {
            return response()->json([
                'status' => false,
                'message' => 'Bình luận không tồn tại.',
            ], 404);
        }

        // Nếu đã có reply thì không cho trả lời nữa
        if ($comment->reply) {
            return response()->json([
                'status' => false,
                'message' => 'Bình luận này đã được trả lời, không thể trả lời thêm.',
            ], 400);
        }

        // Lấy thông tin admin trả lời (giả sử đã đăng nhập)
        $admin = $request->user();
        $comment->reply = $request->reply;
        $comment->replied_by = $admin ? $admin->user_id : null;
        $comment->replied_at = now(); // Thêm thời gian trả lời
        $comment->save();

        return response()->json([
            'status' => true,
            'message' => 'Trả lời bình luận thành công.',
            'data' => $comment
        ]);
    }
}
