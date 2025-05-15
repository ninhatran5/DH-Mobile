<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attribute;
use Illuminate\Http\Request;

class AttributeController extends Controller
{
    /**
     * Display a listing of the resource.
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
     * Store a newly created resource in storage.
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
     * Display the specified resource.
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
     * Update the specified resource in storage.
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
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
        $attribute = Attribute::find($id);
        if (!$attribute) {
            return response()->json([
                'message' => 'Không tìm thấy thuộc tính',
                'status' => 404,
            ],404);
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
