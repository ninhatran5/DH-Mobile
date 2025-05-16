<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AttributeValue;
use App\Models\AttributeValues;
use Illuminate\Http\Request;

class attributevalueController extends Controller
{
    /**
     * Display a listing of the resource.
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
     * Store a newly created resource in storage.
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
     * Display the specified resource.
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
     * Update the specified resource in storage.
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
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
        $attributevalue = AttributeValue::find($id);
        if (!$attributevalue) {
            return response()->json([
                'message' => 'Không tìm thấy thuộc tính con ',
                'status' => 404,
            ],404);
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
