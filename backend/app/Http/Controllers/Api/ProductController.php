<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/products",
     *     summary="Lấy danh sách sản phẩm",
     *     tags={"Product"},
     *     @OA\Response(response=200, description="Thành công")
     * )
     */
    public function index()
    {
        //
        $products = Product::all();
        return response()->json([
            'message' => 'Lấy danh sách sản phẩm thành công',
            'data' => $products,
            'status' => 200,
        ])->setStatusCode(200, 'OK');
    }

    /**
     * @OA\Post(
     *     path="/api/products",
     *     summary="Thêm sản phẩm mới",
     *     tags={"Product"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name","category_id"},
     *             @OA\Property(property="name", type="string"),
     *             @OA\Property(property="category_id", type="integer"),
     *             @OA\Property(property="description", type="string"),
     *             @OA\Property(property="image_url", type="string", format="binary")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Tạo thành công")
     * )
     */
    public function store(Request $request)
    {
        //
        $request->validate([
            'name' => 'required|string|max:200',
            'category_id' => 'required|integer',
            'description' => 'nullable|string|max:255',
            'image_url' => 'nullable',
        ]);
        $product = Product::create($request->only(['name', 'category_id', 'description', 'image_url']));
        if ($request->hasFile('image_url')) {
            // Lưu ảnh vào thư mục public/product
            $path = $request->file('image_url')->store('product', 'public');
            $product->image_url = $path;
            $product->save();
        }
        return response()->json([
            'message' => 'Thêm sản phẩm thành công',
            'data' => $product,
            'status' => 201,
        ])->setStatusCode(201, 'Created');
    }

    /**
     * @OA\Get(
     *     path="/api/products/{id}",
     *     summary="Lấy sản phẩm theo id",
     *     tags={"Product"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Thành công"),
     *     @OA\Response(response=404, description="Không tìm thấy")
     * )
     */
    public function show(string $id)
    {
        //
        $product = Product::find($id);
        if ($product) {
            return response()->json($product, 200);
        } else {
            return response()->json([
                'message' => 'Sản phẩm không tồn tại',
                'status' => 404,
            ])->setStatusCode(404, 'Not Found');
        }
    }

    /**
     * @OA\Put(
     *     path="/api/products/{id}",
     *     summary="Cập nhật sản phẩm theo id",
     *     tags={"Product"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name","category_id"},
     *             @OA\Property(property="name", type="string"),
     *             @OA\Property(property="category_id", type="integer"),
     *             @OA\Property(property="description", type="string"),
     *             @OA\Property(property="image_url", type="string", format="binary")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Cập nhật thành công"),
     *     @OA\Response(response=404, description="Không tìm thấy")
     * )
     */
    public function update(Request $request, string $id)
    {
        //
        $request->validate([
            'name' => 'required|string|max:200',
            'category_id' => 'required|integer',
            'description' => 'nullable|string|max:255',
            'image_url' => 'nullable',
        ]);
        $product = Product::find($id);
        if ($product) {
            $product->update($request->only(['name', 'category_id', 'description', 'image_url']));
            if ($request->hasFile('image_url')) {
                // Lưu ảnh vào thư mục public/product
                $path = $request->file('image_url')->store('product', 'public');
                $product->image_url = $path;
                $product->save();
            }
            return response()->json([
                'message' => 'Cập nhật sản phẩm thành công',
                'data' => $product,
                'status' => 200,
            ])->setStatusCode(200, 'OK');
        } else {
            return response()->json([
                'message' => 'Sản phẩm không tồn tại',
                'status' => 404,
            ])->setStatusCode(404, 'Not Found');
        }
    }

    /**
     * @OA\Delete(
     *     path="/api/products/{id}",
     *     summary="Xóa mềm sản phẩm theo id",
     *     tags={"Product"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Xóa thành công"),
     *     @OA\Response(response=404, description="Không tìm thấy")
     * )
     */
    public function destroy(string $id)
    {
        //
        $product = Product::find($id);
        if ($product) {
            $product->delete();
            return response()->json([
                'message' => 'Đã bỏ vào thùng rác thành công',
                'status' => 200,
            ])->setStatusCode(200, 'OK');
        } else {
            return response()->json([
                'message' => 'Sản phẩm không tồn tại',
                'status' => 404,
            ])->setStatusCode(404, 'Not Found');
        }
    }
    public function trashed()
    {

        $deletedProduct = Product::onlyTrashed()->orderBy('deleted_at', 'DESC')->get();

        if ($deletedProduct->isEmpty()) {
            return response()->json([
                'message' => 'Không tìm thấy sản phẩm đã xóa mềm',
                'data' => [],
                'status' => 404,
            ], 404);
        }

        return response()->json([
            'message' => 'Lấy danh sách sản phẩm đã xóa (mềm) thành công',
            'data' => $deletedProduct,
            'status' => 200,
        ], 200);
    }
    // khôi phục sản phẩm đã xóa mềm
    public function restore($id)
    {
        $product = Product::withTrashed()->find($id);
        if (!$product) {
            return response()->json([
                'message' => 'sản phẩm không tồn tại',
                'status' => 404,
            ], 404);
        }
        $product->restore();
        return response()->json([
            'message' => 'Khôi phục sản phẩm thành công',
            'data' => $product,
            'status' => 200,
        ])->setStatusCode(200, 'OK');
    }
    // xóa vĩnh viễn sản phẩm đã xóa mềm
    public function forceDelete($id)
    {
        $product = Product::withTrashed()->find($id);
        if (!$product) {
            return response()->json([
                'message' => 'sản phẩm không tồn tại',
                'status' => 404,
            ], 404);
        }
        $product->forceDelete();
        return response()->json([
            'message' => 'Xóa vĩnh viễn sản phẩm thành công',
            'status' => 200,
        ])->setStatusCode(200, 'OK');
    }
}
