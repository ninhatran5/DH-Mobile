<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProductsViews;
use Illuminate\Http\Request;

class ProductsViewsController extends Controller
{
    // khi người dùng xem sản phẩm, sẽ lưu lại thông tin vào bảng products_views
    public function addview(Request $request)
    {
        // kiểm tra dữ liệu đầu vào gửi lên frontend
        $validated = $request->validate([
            'product_id' => 'required|integer|exists:products,id',
            'user_id' => 'nullable|integer|exists:users,id',      
        ]);
        $view = ProductsViews::create([
            'user_id' => $validated['user_id'] ?? null,
            'product_id' => $validated['product_id'],
            'viewed_at' => now(),
        ]);
        return response()->json([
            'success' => true,
            'message' => 'Product view recorded successfully',
            'data' => $view,
        ], 201);
    }
    // // lấy danh sách tất cả các sản phẩm đã xem của người dùng
    // public function getAllViews(Request $request)
    // {
    //     $views = ProductsViews::with(['user', 'product'])->get();
        
    //     return response()->json([
    //         'success' => true,
    //         'message' => 'All product views retrieved successfully',
    //         'data' => $views,
    //     ], 200);
    // }
    //  xóa một bản ghi trong bảng products_views theo view_id
    public function deleteView(Request $request, $view_id)
    {
        // kiểm tra xem view_id có tồn tại trong bảng products_views không
        $view = ProductsViews::find($view_id);
        if (!$view) {
            return response()->json([
                'success' => false,
                'message' => 'Product view not found',
            ], 404);
        }
        
        // xóa bản ghi
        $view->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Product view deleted successfully',
        ], 200);
    }
    public function deleteAllViews(Request $request)
    {
        // xóa tất cả bản ghi trong bảng products_views
        ProductsViews::truncate();
        
        return response()->json([
            'success' => true,
            'message' => 'All product views deleted successfully',
        ], 200);
    }
    // lấy danh sách sản phẩm đã xem của người dùng theo user_id
    public function getViewsByUserId(Request $request, $user_id)
    {
        // kiểm tra xem user_id có tồn tại trong bảng users không
        $views = ProductsViews::where('user_id', $user_id)->with(['user', 'product'])->get();
        
        if ($views->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No product views found for this user',
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Product views retrieved successfully',
            'data' => $views,
        ], 200);
    }
    // lấy danh sách sản phẩm đã xem theo product_id
    public function getViewsByProductId(Request $request, $product_id)
    {
        // kiểm tra xem product_id có tồn tại trong bảng products không
        $views = ProductsViews::where('product_id', $product_id)->with(['user', 'product'])->get();
        
        if ($views->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No product views found for this product',
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Product views retrieved successfully',
            'data' => $views,
        ], 200);
    }

}

