<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;
use Cloudinary\Cloudinary;

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
     *             required={"product_id","sku","price","stock"},
     *             @OA\Property(property="product_id", type="integer"),
     *             @OA\Property(property="sku", type="string"),
     *             @OA\Property(property="price", type="number"),
     *             @OA\Property(property="price_original", type="number"),
     *             @OA\Property(property="image_url", type="string"),
     *             @OA\Property(property="stock", type="integer"),
     *             @OA\Property(property="is_active", type="boolean")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Tạo thành công")
     * )
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'product_id' => 'required|integer',
            'sku' => 'required|string|max:50|unique:product_variants,sku',
            'price' => 'required|numeric',
            'price_original' => 'nullable|numeric',
            'image_url' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'stock' => 'required|integer',
            'is_active' => 'nullable|boolean',
        ]);
        if ($request->hasFile('image_url')) {
            try {
                $cloudinary = app(Cloudinary::class);
                $uploadApi = $cloudinary->uploadApi();
                $result = $uploadApi->upload($request->file('image_url')->getRealPath(), [
                    'folder' => 'product_variants'
                ]);
                $validatedData['image_url'] = $result['secure_url'];
            } catch (\Exception $e) {
                return response()->json([
                    'message' => 'Lỗi khi upload ảnh: ' . $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine()
                ], 500);
            }
        }
        $variant = ProductVariant::create($validatedData);
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
     *             required={"sku","price","stock"},
     *             @OA\Property(property="sku", type="string"),
     *             @OA\Property(property="price", type="number"),
     *             @OA\Property(property="price_original", type="number"),
     *             @OA\Property(property="image_url", type="string"),
     *             @OA\Property(property="stock", type="integer"),
     *             @OA\Property(property="is_active", type="boolean")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Cập nhật thành công"),
     *     @OA\Response(response=404, description="Không tìm thấy")
     * )
     */
    public function update(Request $request, $id)
    {
        $variant = ProductVariant::find($id);
        if (!$variant) {
            return response()->json([
                'message' => 'Biến thể sản phẩm không tồn tại',
                'status' => 404,
            ], 404);
        }
        $validatedData = $request->validate([
            'sku' => 'required|string|max:50|unique:product_variants,sku,' . $id . ',variant_id',
            'price' => 'required|numeric',
            'price_original' => 'nullable|numeric',
            'image_url' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'stock' => 'required|integer',
            'is_active' => 'nullable|boolean',
        ]);
        if ($request->hasFile('image_url')) {
            try {
                $cloudinary = app(Cloudinary::class);
                if ($variant->image_url) {
                    $oldImageUrl = $variant->image_url;
                    $publicId = $this->getPublicIdFromUrl($oldImageUrl);
                    if ($publicId) {
                        $cloudinary->uploadApi()->destroy($publicId, [
                            'resource_type' => 'image'
                        ]);
                    }
                }
                $uploadApi = $cloudinary->uploadApi();
                $result = $uploadApi->upload($request->file('image_url')->getRealPath(), [
                    'folder' => 'product_variants'
                ]);
                $validatedData['image_url'] = $result['secure_url'];
            } catch (\Exception $e) {
                return response()->json([
                    'message' => 'Lỗi khi upload ảnh: ' . $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine()
                ], 500);
            }
        }
        $variant->update($validatedData);
        if ($request->has('attribute_value_ids')) {
            $variant->attributeValues()->sync($request->input('attribute_value_ids'));
        }
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
     * @OA\Get(
     *     path="/api/productvariants/trashed",
     *     summary="Lấy danh sách biến thể sản phẩm đã xóa mềm",
     *     tags={"ProductVariants"},
     *     @OA\Response(response=200, description="Thành công")
     * )
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
     * @OA\Post(
     *     path="/api/productvariants/restore/{id}",
     *     summary="Khôi phục biến thể sản phẩm đã xóa mềm",
     *     tags={"ProductVariants"},
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
     * @OA\Delete(
     *     path="/api/productvariants/force-delete/{id}",
     *     summary="Xóa vĩnh viễn biến thể sản phẩm đã xóa mềm",
     *     tags={"ProductVariants"},
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

    private function getPublicIdFromUrl($url)
    {
        if (empty($url)) {
            return null;
        }
        $pattern = '/\/upload\/(?:v\d+\/)?(.+)$/';
        if (preg_match($pattern, $url, $matches)) {
            $publicId = preg_replace('/\.[^.]+$/', '', $matches[1]);
            return $publicId;
        }
        return null;
    }
}
