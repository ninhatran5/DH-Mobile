<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AttributeValue;
use App\Models\AttributeValues;
use Illuminate\Http\Request;

class attributevalueController extends Controller
{

    /**
     * @OA\Get(
     *     path="/api/attributevalue",
     *     summary="Lấy danh sách thuộc tính con",
     *     tags={"AttributeValue"},
     *     @OA\Response(response=200, description="Thành công")
     * )
     */
    public function index()
    {
        //
        $attributevalue = AttributeValue::all();
        return response()->json([
            'message' => 'Lấy danh sách thuộc tính thành công',
            'data' => $attributevalue,
            'status' => 200,
        ])->setStatusCode(200, 'OK');
    }

    /**
     * @OA\Post(
     *     path="/api/attributevalues",
     *     summary="Thêm thuộc tính con mới",
     *     tags={"AttributeValue"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"attribute_id","value"},
     *             @OA\Property(property="attribute_id", type="integer"),
     *             @OA\Property(property="value", type="string")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Tạo thành công")
     * )
     */
    public function store(Request $request)
    {
        //
        $request->validate([
            'attribute_id' => 'required|integer',
            'value' => 'required|string|max:200',
        ]);
        $attributevalue = AttributeValue::create($request->only(['attribute_id', 'value']));
        return response()->json([
            'message' => 'Thêm thuộc tính con thành công ',
            'data' => $attributevalue,
            'status' => 201,
        ])->setStatusCode(201, 'Created');
    }

    /**
     * @OA\Get(
     *     path="/api/attributevalue/{id}",
     *     summary="Lấy thuộc tính con theo id",
     *     tags={"AttributeValue"},
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
        $attributevalue = AttributeValue::find($id);
        if ($attributevalue) {
            # code...
            return response()->json($attributevalue, 200);
        } else {
            # code...
            return response()->json(['message' => 'Không tìm thấy thuộc tính con ',]);
        }
    }

    /**
     * @OA\Put(
     *     path="/api/attributevalues/{id}",
     *     summary="Cập nhật thuộc tính con theo id",
     *     tags={"AttributeValue"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"attribute_id","value"},
     *             @OA\Property(property="attribute_id", type="integer"),
     *             @OA\Property(property="value", type="string")
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
            'attribute_id' => 'required|integer',
            'value' => 'required|string|max:200',
        ]);
        $attributevalue = AttributeValue::find($id);
        if ($attributevalue) {
            $attributevalue->update($request->only(['attribute_id', 'value']));
            return response()->json([
                'message' => 'Cập nhật thuộc tính con thành công',
                'data' => $attributevalue,
                'status' => 200,
            ])->setStatusCode(200, 'OK');
        } else {
            return response()->json(['message' => 'Không tìm thấy thuộc tính con  ',]);
        }
    }

    /**
     * @OA\Delete(
     *     path="/api/attributevalues/{id}",
     *     summary="Xóa mềm thuộc tính con theo id",
     *     tags={"AttributeValue"},
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
        $attributevalue = AttributeValue::find($id);
        if (!$attributevalue) {
            return response()->json([
                'message' => 'Không tìm thấy thuộc tính con ',
                'status' => 404,
            ], 404);
        }
        $attributevalue->delete();
        return response()->json([
            'message' => 'Đã bỏ vào thùng rác thành công',
            'status' => 200,
        ])->setStatusCode(200, 'OK');
    }
    public function trashed()
    {
        //
        $attributevalue = AttributeValue::onlyTrashed()->get();
        return response()->json([
            'message' => 'Lấy danh sách thuộc tính con đã xóa thành công',
            'data' => $attributevalue,
            'status' => 200,
        ])->setStatusCode(200, 'OK');
    }
    public function restore($id)
    {
        //
        $attributevalue = AttributeValue::withTrashed()->find($id);
        if ($attributevalue) {
            $attributevalue->restore();
            return response()->json([
                'message' => 'Khôi phục thuộc tính con thành công',
                'data' => $attributevalue,
                'status' => 200,
            ])->setStatusCode(200, 'OK');
        } else {
            return response()->json(['message' => 'Không tìm thấy thuộc tính con ',]);
        }
    }
    public function forceDelete($id)
    {
        //
        $attributevalue = AttributeValue::withTrashed()->find($id);
        if (!$attributevalue) {
            return response()->json([
                'message' => 'Không tìm thấy thuộc tính con đã xóa',
                'status' => 404,
            ], 404);
        }
        $attributevalue->forceDelete();
        return response()->json([
            'message' => 'Xóa vĩnh viễn thuộc tính con thành công',
            'status' => 200,
        ])->setStatusCode(200, 'OK');
    }
}
