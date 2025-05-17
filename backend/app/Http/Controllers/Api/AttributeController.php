<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attribute;
use Illuminate\Http\Request;

class AttributeController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/attributes",
     *     summary="Lấy danh sách thuộc tính",
     *     tags={"Attribute"},
     *     @OA\Response(response=200, description="Thành công")
     * )
     */
    public function index()
    {
        //
        $attribute = Attribute::all();
        return response()->json([
            'message' => 'Lấy danh sách thuộc tính thành công',
            'data' => $attribute,
            'status' => 200,
        ])->setStatusCode(200, 'OK');
    }

    /**
     * @OA\Post(
     *     path="/api/attributes",
     *     summary="Thêm thuộc tính mới",
     *     tags={"Attribute"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name"},
     *             @OA\Property(property="name", type="string")
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
        ]);
        $attribute = Attribute::create($request->only(['name']));
        return response()->json([
            'message' => 'Thêm thuộc tính thành công ',
            'data' => $attribute,
            'status' => 201,
        ])->setStatusCode(201, 'Created');
    }

    /**
     * @OA\Get(
     *     path="/api/attributes/{id}",
     *     summary="Lấy thuộc tính theo id",
     *     tags={"Attribute"},
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
        $attribute = Attribute::find($id);
        if ($attribute) {
            # code...
            return response()->json($attribute, 200);
        } else {
            # code...
            return response()->json(['message' => 'Không tìm thấy thuộc tính ',]);
        }
    }

    /**
     * @OA\Put(
     *     path="/api/attributes/{id}",
     *     summary="Cập nhật thuộc tính theo id",
     *     tags={"Attribute"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name"},
     *             @OA\Property(property="name", type="string")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Cập nhật thành công"),
     *     @OA\Response(response=404, description="Không tìm thấy")
     * )
     */
    public function update(Request $request, string $id)
    {
        //
        $request->validate([
            'name' => 'required|string|max:200',
        ]);
        $attribute = Attribute::find($id);
        if ($attribute) {
            $attribute->update($request->only(['name']));
        }
        return response()->json([
            'message' => 'Cập nhật thuộc tính thành công',
            'data' => $attribute,
            'status' => 201,
        ])->setStatusCode(201, 'Created');
    }

    /**
     * @OA\Delete(
     *     path="/api/attributes/{id}",
     *     summary="Xóa mềm thuộc tính theo id",
     *     tags={"Attribute"},
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
        $attribute = Attribute::find($id);
        if (!$attribute) {
            return response()->json([
                'message' => 'Không tìm thấy thuộc tính',
                'status' => 404,
            ], 404);
        }
        $attribute->delete();
        return response()->json([
            'message' => 'Đã bỏ vào thùng rác thành công',
            'status' => 200,
        ])->setStatusCode(200, 'OK');
    }
    public function trashed()
    {
        //
        $attribute = Attribute::onlyTrashed()->get();
        return response()->json([
            'message' => 'Lấy danh sách thuộc tính đã xóa thành công',
            'data' => $attribute,
            'status' => 200,
        ])->setStatusCode(200, 'OK');
    }
    public function restore($id)
    {
        //
        $attribute = Attribute::withTrashed()->find($id);
        if (!$attribute) {
            return response()->json([
                'message' => 'Không tìm thấy thuộc tính đã xóa',
                'status' => 404,
            ], 404);
        }
        $attribute->restore();
        return response()->json([
            'message' => 'Khôi phục thuộc tính thành công',
            'data' => $attribute,
            'status' => 200,
        ])->setStatusCode(200, 'OK');
    }
    public function forceDelete($id)
    {
        //
        $attribute = Attribute::withTrashed()->find($id);
        if (!$attribute) {
            return response()->json([
                'message' => 'Không tìm thấy thuộc tính đã xóa',
                'status' => 404,
            ], 404);
        }
        $attribute->forceDelete();
        return response()->json([
            'message' => 'Xóa thuộc tính vĩnh viễn thành công',
            'status' => 200,
        ])->setStatusCode(200, 'OK');
    }
}
