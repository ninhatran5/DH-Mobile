<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
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
     * Store a newly created resource in storage.
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
     * Display the specified resource.
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
     * Update the specified resource in storage.
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
     * Remove the specified resource from storage.
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
