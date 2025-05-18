<?php

namespace App\Http\Controllers\Api;

use App\Models\ProductSpecifications;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ProductSpecificationsController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/product-specifications",
     *     summary="Lấy danh sách thông số kỹ thuật sản phẩm",
     *     tags={"ProductSpecifications"},
     *     @OA\Response(response=200, description="Thành công")
     * )
     */
    public function index()
    {
        $productSpecifications = ProductSpecifications::all();
        return response()->json([
            'message' => 'Lấy thông tin sản phẩm thành công !',
            'data' => $productSpecifications,
            'status' => 200,
        ])->setStatusCode(200, 'OK');
    }

    /**
     * @OA\Post(
     *     path="/api/product-specifications",
     *     summary="Thêm thông số kỹ thuật sản phẩm mới",
     *     tags={"ProductSpecifications"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"product_id","spec_name","spec_value"},
     *             @OA\Property(property="product_id", type="integer"),
     *             @OA\Property(property="spec_name", type="string"),
     *             @OA\Property(property="spec_value", type="string")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Tạo thành công")
     * )
     */
    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|integer',
            'spec_name' => 'required|string|max:200',
            'spec_value' => 'required|string|max:255',
        ]);
        $productSpecification = ProductSpecifications::create($request->only(['product_id', 'spec_name', 'spec_value']));
        return response()->json([
            'message' => 'Thêm thông tin sản phẩm thành công !',
            'data' => $productSpecification,
            'status' => 201,
        ])->setStatusCode(201, 'Created');
    }

    /**
     * @OA\Get(
     *     path="/api/product-specifications/{id}",
     *     summary="Lấy thông số kỹ thuật sản phẩm theo id",
     *     tags={"ProductSpecifications"},
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
        $productSpecification = ProductSpecifications::find($id);
        if (!$productSpecification) {
            return response()->json([
                'message' => 'Không tìm thấy thông tin sản phẩm !',
                'status' => 404,
            ])->setStatusCode(404, 'Not Found');
        }
        return response()->json([
            'message' => 'Lấy thông tin sản phẩm thành công !',
            'data' => $productSpecification,
            'status' => 200,
        ])->setStatusCode(200, 'OK');
    }

    /**
     * @OA\Put(
     *     path="/api/product-specifications/{id}",
     *     summary="Cập nhật thông số kỹ thuật sản phẩm theo id",
     *     tags={"ProductSpecifications"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"product_id","spec_name","spec_value"},
     *             @OA\Property(property="product_id", type="integer"),
     *             @OA\Property(property="spec_name", type="string"),
     *             @OA\Property(property="spec_value", type="string")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Cập nhật thành công"),
     *     @OA\Response(response=404, description="Không tìm thấy")
     * )
     */
    public function update(Request $request, string $id)
    {
        $productSpecification = ProductSpecifications::find($id);
        if (!$productSpecification) {
            return response()->json([
                'message' => 'Không tìm thấy thông tin sản phẩm !',
                'status' => 404,
            ])->setStatusCode(404, 'Not Found');
        }
        $request->validate([
            'product_id' => 'required|integer',
            'spec_name' => 'required|string|max:200',
            'spec_value' => 'required|string|max:255',
        ]);
        $productSpecification->update($request->only(['product_id', 'spec_name', 'spec_value']));
        return response()->json([
            'message' => 'Cập nhật thông tin sản phẩm thành công !',
            'data' => $productSpecification,
            'status' => 200,
        ])->setStatusCode(200, 'OK');
    }

    /**
     * @OA\Delete(
     *     path="/api/product-specifications/{id}",
     *     summary="Xóa mềm thông số kỹ thuật sản phẩm theo id",
     *     tags={"ProductSpecifications"},
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
        $productSpecification = ProductSpecifications::find($id);
        if (!$productSpecification) {
            return response()->json([
                'message' => 'Không tìm thấy thông tin sản phẩm !',
                'status' => 404,
            ])->setStatusCode(404, 'Not Found');
        }
        $productSpecification->delete();
        return response()->json([
            'message' => 'Xóa thông tin sản phẩm thành công !',
            'status' => 200,
        ])->setStatusCode(200, 'OK');
    }

    /**
     * @OA\Get(
     *     path="/api/product-specifications/trashed",
     *     summary="Lấy danh sách thông số kỹ thuật sản phẩm đã xóa mềm",
     *     tags={"ProductSpecifications"},
     *     @OA\Response(response=200, description="Thành công")
     * )
     */
    public function trashed()
    {
        $productSpecifications = ProductSpecifications::onlyTrashed()->orderBy('deleted_at', 'DESC')->get();
        if ($productSpecifications->isEmpty()) {
            return response()->json([
                'message' => 'Không tìm thấy thông số kỹ thuật đã xóa mềm',
                'data' => [],
                'status' => 404,
            ], 404);
        }
        return response()->json([
            'message' => 'Lấy danh sách thông số kỹ thuật đã xóa (mềm) thành công',
            'data' => $productSpecifications,
            'status' => 200,
        ], 200);
    }

    /**
     * Khôi phục thông số kỹ thuật đã xóa mềm
     */
    public function restore($id)
    {
        $productSpecification = ProductSpecifications::withTrashed()->find($id);
        if (!$productSpecification) {
            return response()->json([
                'message' => 'Thông số kỹ thuật không tồn tại',
                'status' => 404,
            ], 404);
        }
        $productSpecification->restore();
        return response()->json([
            'message' => 'Khôi phục thông số kỹ thuật thành công',
            'data' => $productSpecification,
            'status' => 200,
        ])->setStatusCode(200, 'OK');
    }

    /**
     * Xóa vĩnh viễn thông số kỹ thuật đã xóa mềm
     */
    public function forceDelete($id)
    {
        $productSpecification = ProductSpecifications::withTrashed()->find($id);
        if (!$productSpecification) {
            return response()->json([
                'message' => 'Thông số kỹ thuật không tồn tại',
                'status' => 404,
            ], 404);
        }
        $productSpecification->forceDelete();
        return response()->json([
            'message' => 'Xóa vĩnh viễn thông số kỹ thuật thành công',
            'status' => 200,
        ])->setStatusCode(200, 'OK');
    }
}
