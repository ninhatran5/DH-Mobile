<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;

class ProductVariantsController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/productvariants",
     *     summary="Lấy danh sách biến thể sản phẩm",
     *     tags={"ProductVariants"},
     *     @OA\Response(response=200, description="Thành công")
     * )
     */
    public function index()
    {
        $variants = ProductVariant::with(['product', 'attributeValues'])->get();
        return response()->json([
            'message' => 'Lấy danh sách biến thể sản phẩm thành công',
            'data' => $variants,
            'status' => 200,
        ])->setStatusCode(200, 'OK');
    }

    /**
     * @OA\Post(
     *     path="/api/productvariants",
     *     summary="Thêm biến thể sản phẩm mới",
     *     tags={"ProductVariants"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"product_id","sku","price","stock_quantity"},
     *             @OA\Property(property="product_id", type="integer"),
     *             @OA\Property(property="sku", type="string"),
     *             @OA\Property(property="price", type="number"),
     *             @OA\Property(property="stock_quantity", type="integer")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Tạo thành công")
     * )
     */
    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|integer',
            'sku' => 'required|string|max:100|unique:product_variants,sku',
            'price' => 'required|numeric',
            'image_url' => 'nullable',
            'stock_quantity' => 'required|integer',
        ]);
        $data = $request->only(['product_id', 'sku', 'price', 'image_url', 'stock_quantity']);
        if ($request->hasFile('image_url')) {
            $path = $request->file('image_url')->store('product_variants', 'public');
            $data['image_url'] = $path;
        }
        $variant = ProductVariant::create($data);
        // Gán attributeValues nếu có
        if ($request->has('attribute_value_ids')) {
            $variant->attributeValues()->sync($request->input('attribute_value_ids'));
        }
        return response()->json([
            'message' => 'Thêm biến thể sản phẩm thành công',
            'data' => $variant,
            'status' => 201,
        ])->setStatusCode(201, 'Created');
    }

    /**
     * @OA\Get(
     *     path="/api/productvariants/{id}",
     *     summary="Lấy chi tiết biến thể sản phẩm",
     *     tags={"ProductVariants"},
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
        $variant = ProductVariant::with(['product', 'attributeValues'])->find($id);
        if ($variant) {
            return response()->json($variant, 200);
        } else {
            return response()->json(['message' => 'Không tìm thấy biến thể sản phẩm'], 404);
        }
    }

    /**
     * @OA\Put(
     *     path="/api/productvariants/{id}",
     *     summary="Cập nhật biến thể sản phẩm",
     *     tags={"ProductVariants"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"sku","price","stock_quantity"},
     *             @OA\Property(property="sku", type="string"),
     *             @OA\Property(property="price", type="number"),
     *             @OA\Property(property="stock_quantity", type="integer")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Cập nhật thành công"),
     *     @OA\Response(response=404, description="Không tìm thấy")
     * )
     */
    public function update(Request $request, string $id)
    {
        $request->validate([
            'sku' => 'required|string|max:100|unique:product_variants,sku,' . $id . ',variant_id',
            'price' => 'required|numeric',
            'image_url' => 'nullable',
            'stock_quantity' => 'required|integer',
        ]);

        $variant = ProductVariant::find($id);
        if (!$variant) {
            return response()->json([
                'message' => 'Biến thể sản phẩm không tồn tại',
                'status' => 404,
            ], 404);
        }

        $validatedData = $request->only(['sku', 'price', 'image_url', 'stock_quantity']);
        if ($request->hasFile('image_url')) {
            // Xoá ảnh cũ nếu có
            if ($variant->image_url) {
                Storage::disk('public')->delete($variant->image_url);
            }
            // Lưu ảnh mới
            $path = $request->file('image_url')->store('product_variants', 'public');
            $validatedData['image_url'] = $path;
        }
        $variant->update($validatedData);

        return response()->json([
            'message' => 'Cập nhật biến thể sản phẩm thành công',
            'data' => $variant,
            'status' => 200,
        ]);
    }

    /**
     * @OA\Delete(
     *     path="/api/productvariants/{id}",
     *     summary="Xóa mềm biến thể sản phẩm",
     *     tags={"ProductVariants"},
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
        $variant = ProductVariant::find($id);
        if (!$variant) {
            return response()->json([
                'message' => 'Không tìm thấy biến thể sản phẩm',
                'status' => 404,
            ], 404);
        }
        $variant->delete();
        return response()->json([
            'message' => 'Đã bỏ vào thùng rác thành công',
            'status' => 200,
        ])->setStatusCode(200, 'OK');
    }

    /**
     * Display a listing of the trashed resources.
     */
    public function trashed()
    {
        $variants = ProductVariant::onlyTrashed()->orderBy('deleted_at', 'DESC')->get();
        return response()->json([
            'message' => 'Lấy danh sách biến thể đã xóa thành công',
            'data' => $variants,
            'status' => 200,
        ])->setStatusCode(200, 'OK');
    }

    /**
     * Restore the specified trashed resource.
     */
    public function restore($id)
    {
        $variant = ProductVariant::withTrashed()->find($id);
        if (!$variant) {
            return response()->json([
                'message' => 'Không tìm thấy biến thể đã xóa',
                'status' => 404,
            ], 404);
        }
        $variant->restore();
        return response()->json([
            'message' => 'Khôi phục biến thể thành công',
            'data' => $variant,
            'status' => 200,
        ])->setStatusCode(200, 'OK');
    }

    /**
     * Force delete the specified trashed resource.
     */
    public function forceDelete($id)
    {
        $variant = ProductVariant::withTrashed()->find($id);
        if (!$variant) {
            return response()->json([
                'message' => 'Không tìm thấy biến thể đã xóa',
                'status' => 404,
            ], 404);
        }
        $variant->forceDelete();
        return response()->json([
            'message' => 'Xóa vĩnh viễn biến thể thành công',
            'status' => 200,
        ])->setStatusCode(200, 'OK');
    }
}
