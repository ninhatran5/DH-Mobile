<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // 
        $categories = Category::all();

        return response()->json([
            'massage' => 'Lấy danh sách danh mục thành công',
            'data' => $categories,
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
            'description' => 'nullable|string|max:255',
            'image_url' => 'nullable|url',
        ]);
        $category = Category::create($request->only(['name', 'description', 'image_url']));
        return response()->json([
            'message' => 'Thêm danh mục thành công',
            'data' => $category,
            'status' => 201,
        ])->setStatusCode(201, 'Created');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
        $categories = Category::find($id);
        if ($categories) {
            return response()->json($categories, 200);
        } else {
            return response()->json(['message' => 'Không tìm thấy danh mục'], 404);
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
            'description' => 'nullable|string|max:255',
            'image_url' => 'nullable|url',
        ]);

        // Bước 2: Tìm danh mục theo ID
        $category = Category::find($id);

        if (!$category) {
            return response()->json([
                'message' => 'Danh mục không tồn tại',
                'status' => 404,
            ], 404);
        }

        // Bước 3: Cập nhật dữ liệu
        $category->update($request->only(['name', 'description', 'image_url']));

        // Bước 4: Trả về phản hồi
        return response()->json([
            'message' => 'Cập nhật danh mục thành công',
            'data' => $category,
            'status' => 200,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
        $category = Category::find($id);
        if (!$category) {
            return response()->json([
                'message' => 'Danh mục không tồn tại',
                'status' => 404,
            ], 404);
        }
        $category->delete();
        return response()->json([
            'message' => 'Đã bỏ vào thùng rác thành công',
            'status' => 200,
        ])->setStatusCode(200, 'OK');
    }
    // xem danh sách danh mục đã xóa mềm 
    public function trashed()
    {

        $deletedCategories = Category::onlyTrashed()->orderBy('deleted_at', 'DESC')->get();

        if ($deletedCategories->isEmpty()) {
            return response()->json([
                'message' => 'Không tìm thấy danh mục đã xóa mềm',
                'data' => [],
                'status' => 404,
            ], 404);
        }

        return response()->json([
            'message' => 'Lấy danh sách danh mục đã xóa (mềm) thành công',
            'data' => $deletedCategories,
            'status' => 200,
        ], 200);
    }
    // khôi phục danh mục đã xóa mềm
    public function restore($id)
    {
        $category = Category::withTrashed()->find($id);
        if (!$category) {
            return response()->json([
                'message' => 'Danh mục không tồn tại',
                'status' => 404,
            ], 404);
        }
        $category->restore();
        return response()->json([
            'message' => 'Khôi phục danh mục thành công',
            'data' => $category,
            'status' => 200,
        ])->setStatusCode(200, 'OK');
    }
    // xóa vĩnh viễn danh mục đã xóa mềm
    public function forceDelete($id)
    {
        $category = Category::withTrashed()->find($id);
        if (!$category) {
            return response()->json([
                'message' => 'Danh mục không tồn tại',
                'status' => 404,
            ], 404);
        }
        $category->forceDelete();
        return response()->json([
            'message' => 'Xóa vĩnh viễn danh mục thành công',
            'status' => 200,
        ])->setStatusCode(200, 'OK');
    }
    // lấy danh sách danh mục đã xóa mềm

}
