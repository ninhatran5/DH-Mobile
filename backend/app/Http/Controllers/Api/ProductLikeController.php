<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Models\Product;
use App\Models\ProductLike;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Http\Resources\ProductLikeResource;

class ProductLikeController extends Controller
{
    // thích sản phẩm
    public function productlike($id)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json([
                'status' => false,
                'message' => 'Người dùng không tồn tại'
            ]);
        }

        $product = Product::where('product_id', $id)->first();
        if (!$product) {
            return response()->json([
                'status' => false,
                'message' => 'Sản phẩm không tồn tại'
            ]);
        }

        $productlike = ProductLike::where('user_id', $user->user_id)
            ->where('product_id', $product->product_id)
            ->first();

        if ($productlike) {
            return response()->json([
                'status' => false,
                'message' => 'Bạn đã thích sản phẩm này rồi'
            ]);
        } else {
            ProductLike::create([
                'user_id' => $user->user_id,
                'product_id' => $product->product_id
            ]);
            return response()->json([
                'status' => true,
                'message' => 'Thích sản phẩm thành công'
            ]);
        }
    }

    // Lấy danh sách sản phẩm đã thích theo id người dùng
    public function listproductlike()
    {
        $user = Auth::user();
        $productlikes = ProductLike::with('Product')
            ->where('user_id', $user->user_id)
            ->get();
        if ($productlikes->isEmpty()) {
            return response()->json([
                'status' => false,
                'message' => 'Không có sản phẩm nào đã thích'
            ]);
        } else {
            return response()->json([
                'message' => 'Danh sách sản phẩm đã thích',
                'data' => ProductLikeResource::collection($productlikes)
            ]);
        }
    }

    // Bỏ thích sản phẩm
    public function productunlike($id)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json([
                'status' => false,
                'message' => 'Người dùng không tồn tại'
            ], 401);
        }

        $product = Product::where('product_id', $id)->first();
        if (!$product) {
            return response()->json([
                'status' => false,
                'message' => 'Sản phẩm không tồn tại'
            ]);
        }

        $productlike = ProductLike::where('user_id', $user->user_id)
            ->where('product_id', $product->product_id)
            ->first();

        if ($productlike) {
            $productlike->delete();
            return response()->json([
                'status' => true,
                'message' => 'Bỏ thích sản phẩm thành công'
            ]);
        } else {
            return response()->json([
                'status' => false,
                'message' => 'Bạn chưa thích sản phẩm này'
            ]);
        }
    }
}
