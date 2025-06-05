<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use App\Models\AttributeValue;
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
        $items = VariantAttributeValue::with(['variant', 'value.attribute'])->get();

        // Group variants by variant_id
        $groupedItems = $items->groupBy('variant_id')->map(function ($variantGroup) {
            $variant = $variantGroup->first()->variant;

            // Format attributes with both value_id and attribute value
            $attributes = $variantGroup->map(function ($item) {
                return [
                    'value_id' => $item->value_id,
                    'name' => strtolower($item->value->attribute->name),
                    'value' => $item->value->value
                ];
            })->values();

            $variantData = [
                'variant_id' => $variant->variant_id,
                'product_id' => $variant->product_id,
                'sku' => $variant->sku,
                'price' => $variant->price,
                'price_original' => $variant->price_original,
                'image_url' => $variant->image_url,
                'stock' => $variant->stock,
                'is_active' => $variant->is_active,
                'attributes' => $attributes
            ];

            return $variantData;
        });

        return response()->json([
            'message' => 'Lấy danh sách liên kết biến thể - giá trị thuộc tính thành công',
            'data' => $groupedItems->values(),
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
        $value = AttributeValue::with('attribute')->find($request->value_id);
        if (!$value) {
            return response()->json([
                'message' => 'Giá trị thuộc tính không tồn tại',
                'status' => 404,
            ], 404);
        }
        $attribute_id = $value->attribute_id;

        // Kiểm tra đã tồn tại thuộc tính này cho variant chưa
        $exists = VariantAttributeValue::where('variant_id', $request->variant_id)
            ->whereHas('value', function ($q) use ($attribute_id) {
                $q->where('attribute_id', $attribute_id);
            })
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Biến thể này đã có thuộc tính này rồi',
                'status' => 422,
            ], 422);
        }
        $item = VariantAttributeValue::create($request->only(['variant_id', 'value_id']));
        return response()->json([
            'message' => 'Tạo liên kết biến thể - giá trị thuộc tính thành công',
            'data' => $item,
            'status' => 201,
        ], 201);
    }

    /**
     * @OA\Get(
     *     path="/api/variant-attribute-values/{variant_id}",
     *     summary="Lấy tất cả thuộc tính của một biến thể",
     *     tags={"VariantAttributeValues"},
     *     @OA\Parameter(
     *         name="variant_id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Thành công"),
     *     @OA\Response(response=404, description="Không tìm thấy")
     * )
     */
    public function show(string $variant_id)
    {
        $variant = ProductVariant::find($variant_id);
        if (!$variant) {
            return response()->json([
                'message' => 'Không tìm thấy biến thể',
                'status' => 404,
            ], 404);
        }

        $items = VariantAttributeValue::with(['variant', 'value.attribute'])
            ->where('variant_id', $variant_id)
            ->get();

        if ($items->isEmpty()) {
            // Return variant data even if it has no attributes
            return response()->json([
                'message' => 'Biến thể không có thuộc tính nào',
                'data' => [
                    'variant_id' => $variant->variant_id,
                    'product_id' => $variant->product_id,
                    'sku' => $variant->sku,
                    'price' => $variant->price,
                    'price_original' => $variant->price_original,
                    'image_url' => $variant->image_url,
                    'stock' => $variant->stock,
                    'is_active' => $variant->is_active,
                    'attributes' => []
                ],
                'status' => 200,
            ], 200);
        }
        $attributes = $items->map(function ($item) {
            return [
                'value_id' => $item->value_id,
                'name' => strtolower($item->value->attribute->name),
                'value' => $item->value->value
            ];
        })->values();

        $variantData = [
            'variant_id' => $variant->variant_id,
            'product_id' => $variant->product_id,
            'sku' => $variant->sku,
            'price' => $variant->price,
            'price_original' => $variant->price_original,
            'image_url' => $variant->image_url,
            'stock' => $variant->stock,
            'is_active' => $variant->is_active,
            'attributes' => $attributes
        ];

        return response()->json([
            'message' => 'Lấy thuộc tính của biến thể thành công',
            'data' => $variantData,
            'status' => 200,
        ], 200);
    }

    /**
     * @OA\Put(
     *     path="/api/variant-attribute-values/{variant_id}",
     *     summary="Cập nhật thuộc tính của biến thể",
     *     tags={"VariantAttributeValues"},
     *     @OA\Parameter(
     *         name="variant_id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(
     *                 property="attributes",
     *                 type="array",
     *                 @OA\Items(
     *                     @OA\Property(property="value_id", type="integer")
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(response=200, description="Cập nhật thành công"),
     *     @OA\Response(response=404, description="Không tìm thấy biến thể"),
     *     @OA\Response(response=422, description="Dữ liệu không hợp lệ")
     * )
     */
    public function update(Request $request, string $variant_id)
    {
        // Kiểm tra biến thể tồn tại
        $variant = ProductVariant::find($variant_id);
        if (!$variant) {
            return response()->json([
                'message' => 'Không tìm thấy biến thể',
                'status' => 404,
            ], 404);
        }

        // Validate dữ liệu đầu vào
        if ($request->isJson()) {
            $request->validate([
                'attributes' => 'required|array',
                'attributes.*.value_id' => 'required|integer|exists:attribute_values,value_id',
            ]);
            $attributeValues = collect($request->attributes)->pluck('value_id')->toArray();
        } else {
            $request->validate([
                'value_id' => 'required|array',
                'value_id.*' => 'required|integer|exists:attribute_values,value_id',
            ]);
            $attributeValues = $request->value_id;
        }

        try {
            DB::beginTransaction();

            // Xóa tất cả các thuộc tính hiện tại của biến thể
            VariantAttributeValue::where('variant_id', $variant_id)->delete();

            // Thêm các thuộc tính mới
            $attributes = [];
            foreach ($attributeValues as $value_id) {
                $attributes[] = [
                    'variant_id' => $variant_id,
                    'value_id' => $value_id,
                    'created_at' => now(),
                    'updated_at' => now()
                ];
            }
            VariantAttributeValue::insert($attributes);

            DB::commit();

            // Lấy dữ liệu mới sau khi cập nhật
            $updatedData = $this->show($variant_id)->original;

            return response()->json([
                'message' => 'Cập nhật thuộc tính biến thể thành công',
                'data' => $updatedData['data'],
                'status' => 200,
            ], 200);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'message' => 'Có lỗi xảy ra khi cập nhật thuộc tính',
                'error' => $e->getMessage(),
                'status' => 500,
            ], 500);
        }
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
