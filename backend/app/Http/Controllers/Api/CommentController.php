<?php

namespace App\Http\Controllers\Api;

use App\Models\Comment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;

class CommentController extends Controller
{
    public function index($id)
    {
        $comments = Comment::with(['user', 'product'])
            ->where('product_id', $id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => true,
            'message' => 'Danh sách đánh giá sản phẩm',
            'data' => $comments
        ]);
    }
    
    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|integer|exists:products,product_id',
            'rating' => 'required|integer|min:1|max:5',
            'content' => 'nullable|string|max:1000',
        ]);

        $user = $request->user();
        $productId = $request->product_id;

        // Kiểm tra user đã mua sản phẩm này chưa và đơn hàng đã hoàn thành chưa
        $hasPurchased = DB::table('orders')
            ->join('order_items', 'orders.order_id', '=', 'order_items.order_id')
            ->where('orders.user_id', $user->user_id)
            ->where('orders.status', 'Hoàn thành')
            ->where('order_items.product_id', $productId)
            ->exists();

        if (!$hasPurchased) {
            return response()->json([
                'status' => false,
                'message' => 'Bạn chỉ có thể đánh giá sản phẩm đã mua và đã hoàn thành.',
            ], 403);
        }

        // Nếu đã từng đánh giá rồi -> cập nhật
        $comment = Comment::updateOrCreate(
            ['user_id' => $user->user_id, 'product_id' => $productId],
            ['rating' => $request->rating, 'content' => $request->content]
        );

        return response()->json([
            'status' => true,
            'message' => 'Đánh giá của bạn đã được lưu.',
            'data' => $comment
        ]);
    }
}
