<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Models\Product;
use App\Models\ProductLike;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;

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
        $productlikes = ProductLike::with(['product.productVariants' => function($query) {
            $query->with(['attributeValues' => function($q) {
                $q->with('attribute');
            }]);
        }])
        ->where('user_id', $user->user_id)
        ->get();

        if ($productlikes->isEmpty()) {
            return response()->json([
                'status' => false,
                'message' => 'Không có sản phẩm nào đã thích'
            ]);
        }

        $formattedData = $productlikes->map(function($like) {
            $product = $like->product;
            $variants = $product->productVariants->map(function($variant) {
                
                return [
                    'variant_id' => $variant->variant_id,
                    'sku' => $variant->sku,
                    'price' => $variant->price,
                    'price_original' => $variant->price_original,
                    'image_url' => $variant->image_url,
                    'stock' => $variant->stock,
                ];
            });

            return [
                'product_id' => $product->product_id,
                'name' => $product->name,
                'description' => $product->description,
                'image_url' => $product->image_url,
                'variants' => $variants
            ];
        });

        return response()->json([
            'status' => true,
            'message' => 'Danh sách sản phẩm đã thích',
            'total' => $formattedData->count(),
            'user_id' => $user->user_id,
            'data' => $formattedData,
        ]);

    }
}
