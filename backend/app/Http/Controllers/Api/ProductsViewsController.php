<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProductsViews;
use Illuminate\Http\Request;

class ProductsViewsController extends Controller
{
        /**
     * @OA\Post(
     *     path="/api/productsviews/addview",
     *     summary="Ghi nhận lượt xem sản phẩm",
     *     tags={"ProductsViews"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"product_id"},
     *             @OA\Property(property="product_id", type="integer", example=1),
     *             @OA\Property(property="user_id", type="integer", example=2, nullable=true)
     *         )
     *     ),
     *     @OA\Response(response=201, description="Product view recorded successfully"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    // khi người dùng xem sản phẩm, sẽ lưu lại thông tin vào bảng products_views
    public function addview(Request $request)
    {
        // kiểm tra dữ liệu đầu vào gửi lên frontend
        $validated = $request->validate([
            'product_id' => 'required|integer|exists:products,product_id',
            'user_id' => 'nullable|integer|exists:users,user_id', // nếu bảng users dùng user_id, còn nếu là id thì để users,id
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
        /**
     * @OA\Delete(
     *     path="/api/productsviews/{view_id}",
     *     summary="Xóa một bản ghi lượt xem sản phẩm theo view_id",
     *     tags={"ProductsViews"},
     *     @OA\Parameter(
     *         name="view_id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="xóa bản ghi thành công"),
     *     @OA\Response(response=404, description="xóa bản ghi thất bại, không tìm thấy view_id")
     * )
     */
    //  xóa một bản ghi trong bảng products_views theo view_id
    public function deleteView(Request $request, $view_id)
    {
        // kiểm tra xem view_id có tồn tại trong bảng products_views không
        $view = ProductsViews::find($view_id);
        if (!$view) {
            return response()->json([
                'success' => false,
                'message' => 'xóa bản ghi thất bại, không tìm thấy view_id',
            ], 404);
        }

        // xóa bản ghi
        $view->delete();

        return response()->json([
            'success' => true,
            'message' => 'xóa bản ghi thành công',
        ], 200);
    }
    /**
     * @OA\Delete(
     *     path="/api/productsviews",
     *     summary="Xóa tất cả bản ghi lượt xem sản phẩm",
     *     tags={"ProductsViews"},
     *     @OA\Response(response=200, description="xóa tất cả bản ghi thành công")
     * )
     */
    public function deleteAllViews(Request $request)
    {
        // xóa tất cả bản ghi trong bảng products_views
        ProductsViews::truncate();

        return response()->json([
            'success' => true,
            'message' => 'xóa tất cả bản ghi thành công',
        ], 200);
    }
        /**
     * @OA\Get(
     *     path="/api/productsviews/user/{user_id}",
     *     summary="Lấy danh sách sản phẩm đã xem của người dùng theo user_id",
     *     tags={"ProductsViews"},
     *     @OA\Parameter(
     *         name="user_id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Danh sách sản phẩm đã xem của người dùng"),
     *     @OA\Response(response=404, description="không tìm thấy sản phẩm đã xem của người dùng này")
     * )
     */
    // lấy danh sách sản phẩm đã xem của người dùng theo user_id
    public function getViewsByUserId(Request $request, $user_id)
    {
        // kiểm tra xem user_id có tồn tại trong bảng users không
        $views = ProductsViews::where('user_id', $user_id)->with(['user', 'product'])->orderBy()->get();

        if ($views->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'không tìm thấy sản phẩm đã xem của người dùng này',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Danh sách sản phẩm đã xem của người dùng',
            'data' => $views,
        ], 200);
    }
}
