<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\VariantAttributeValue;

class VariantAttributeValuesController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/variant-attribute-values",
     *     summary="Lấy danh sách liên kết biến thể - giá trị thuộc tính",
     *     tags={"VariantAttributeValues"},
     *     @OA\Response(response=200, description="Thành công")
     * )
     */
    public function index()
    {
        $items = VariantAttributeValue::with(['variant', 'value'])->get();
        return response()->json([
            'message' => 'Lấy danh sách liên kết biến thể - giá trị thuộc tính thành công',
            'data' => $items,
            'status' => 200,
        ], 200);
    }

    /**
     * @OA\Post(
     *     path="/api/variant-attribute-values",
     *     summary="Tạo liên kết biến thể - giá trị thuộc tính mới",
     *     tags={"VariantAttributeValues"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"variant_id","value_id"},
     *             @OA\Property(property="variant_id", type="integer"),
     *             @OA\Property(property="value_id", type="integer")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Tạo thành công")
     * )
     */
    public function store(Request $request)
    {
        $request->validate([
            'variant_id' => 'required|integer|exists:product_variants,variant_id',
            'value_id' => 'required|integer|exists:attribute_values,value_id',
        ]);
        $item = VariantAttributeValue::create($request->only(['variant_id', 'value_id']));
        return response()->json([
            'message' => 'Tạo liên kết biến thể - giá trị thuộc tính thành công',
            'data' => $item,
            'status' => 201,
        ], 201);
    }

    /**
     * @OA\Get(
     *     path="/api/variant-attribute-values/{id}",
     *     summary="Lấy chi tiết liên kết biến thể - giá trị thuộc tính",
     *     tags={"VariantAttributeValues"},
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
        $item = VariantAttributeValue::with(['variant', 'value'])->find($id);
        if (!$item) {
            return response()->json([
                'message' => 'Không tìm thấy liên kết biến thể - giá trị thuộc tính',
                'status' => 404,
            ], 404);
        }
        return response()->json([
            'message' => 'Lấy chi tiết liên kết thành công',
            'data' => $item,
            'status' => 200,
        ], 200);
    }

    /**
     * @OA\Put(
     *     path="/api/variant-attribute-values/{id}",
     *     summary="Cập nhật liên kết biến thể - giá trị thuộc tính",
     *     tags={"VariantAttributeValues"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="variant_id", type="integer"),
     *             @OA\Property(property="value_id", type="integer")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Cập nhật thành công"),
     *     @OA\Response(response=404, description="Không tìm thấy")
     * )
     */
    public function update(Request $request, string $id)
    {
        $item = VariantAttributeValue::find($id);
        if (!$item) {
            return response()->json([
                'message' => 'Không tìm thấy liên kết biến thể - giá trị thuộc tính',
                'status' => 404,
            ], 404);
        }
        $request->validate([
            'variant_id' => 'sometimes|integer|exists:product_variants,variant_id',
            'value_id' => 'sometimes|integer|exists:attribute_values,value_id',
        ]);
        $item->update($request->only(['variant_id', 'value_id']));
        return response()->json([
            'message' => 'Cập nhật liên kết thành công',
            'data' => $item,
            'status' => 200,
        ], 200);
    }

    /**
     * @OA\Delete(
     *     path="/api/variant-attribute-values/{id}",
     *     summary="Xóa mềm liên kết biến thể - giá trị thuộc tính",
     *     tags={"VariantAttributeValues"},
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
        $item = VariantAttributeValue::find($id);
        if (!$item) {
            return response()->json([
                'message' => 'Không tìm thấy liên kết biến thể - giá trị thuộc tính',
                'status' => 404,
            ], 404);
        }
        $item->delete();
        return response()->json([
            'message' => 'Xóa liên kết thành công',
            'status' => 200,
        ], 200);
    }

    /**
     * @OA\Get(
     *     path="/api/variant-attribute-values/trashed",
     *     summary="Lấy danh sách liên kết đã xóa mềm",
     *     tags={"VariantAttributeValues"},
     *     @OA\Response(response=200, description="Thành công")
     * )
     */
    public function trashed()
    {
        $items = VariantAttributeValue::onlyTrashed()->with(['variant', 'value'])->orderBy('deleted_at', 'DESC')->get();
        return response()->json([
            'message' => 'Lấy danh sách liên kết đã xóa thành công',
            'data' => $items,
            'status' => 200,
        ], 200);
    }

    /**
     * @OA\Put(
     *     path="/api/variant-attribute-values/{id}/restore",
     *     summary="Khôi phục liên kết đã xóa mềm",
     *     tags={"VariantAttributeValues"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Khôi phục thành công"),
     *     @OA\Response(response=404, description="Không tìm thấy")
     * )
     */
    public function restore($id)
    {
        $item = VariantAttributeValue::withTrashed()->find($id);
        if (!$item) {
            return response()->json([
                'message' => 'Không tìm thấy liên kết đã xóa',
                'status' => 404,
            ], 404);
        }
        $item->restore();
        return response()->json([
            'message' => 'Khôi phục liên kết thành công',
            'data' => $item,
            'status' => 200,
        ], 200);
    }

    /**
     * @OA\Delete(
     *     path="/api/variant-attribute-values/{id}/force",
     *     summary="Xóa vĩnh viễn liên kết đã xóa mềm",
     *     tags={"VariantAttributeValues"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Xóa vĩnh viễn thành công"),
     *     @OA\Response(response=404, description="Không tìm thấy")
     * )
     */
    public function forceDelete($id)
    {
        $item = VariantAttributeValue::withTrashed()->find($id);
        if (!$item) {
            return response()->json([
                'message' => 'Không tìm thấy liên kết đã xóa',
                'status' => 404,
            ], 404);
        }
        $item->forceDelete();
        return response()->json([
            'message' => 'Xóa vĩnh viễn liên kết thành công',
            'status' => 200,
        ], 200);
    }
}
