<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CategoryController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/categories",
     *     summary="Lấy danh sách danh mục",
     *     tags={"Category"},
     *     @OA\Response(response=200, description="Thành công")
     * )
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
     * @OA\Post(
     *     path="/api/categories",
     *     summary="Thêm danh mục mới",
     *     tags={"Category"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name"},
     *             @OA\Property(property="name", type="string"),
     *             @OA\Property(property="description", type="string"),
     *             @OA\Property(property="image_url", type="string", format="binary")
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
            'description' => 'nullable|string|max:255',
            'image_url' => 'nullable',
        ]);
        $category = Category::create($request->only(['name', 'description', 'image_url']));
        if ($request->hasFile('image_url')) {
            // Lưu ảnh vào thư mục public/category
            $path = $request->file('image_url')->store('category', 'public');
            $category->image_url = $path;
            $category->save();
        }
        return response()->json([
            'message' => 'Thêm danh mục thành công',
            'data' => $category,
            'status' => 201,
        ])->setStatusCode(201, 'Created');
    }

    /**
     * @OA\Get(
     *     path="/api/categories/{id}",
     *     summary="Lấy danh mục theo id",
     *     tags={"Category"},
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
        $categories = Category::find($id);
        if ($categories) {
            return response()->json($categories, 200);
        } else {
            return response()->json(['message' => 'Không tìm thấy danh mục'], 404);
        }
    }

    /**
     * @OA\Put(
     *     path="/api/categories/{id}",
     *     summary="Cập nhật danh mục theo id",
     *     tags={"Category"},
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
     *             @OA\Property(property="name", type="string"),
     *             @OA\Property(property="description", type="string"),
     *             @OA\Property(property="image_url", type="string", format="binary")
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
            'name' => 'required|string|max:200',
            'description' => 'nullable|string|max:255',
            'image_url' => 'nullable',
        ]);

        // Bước 2: Tìm danh mục theo ID
        $category = Category::find($id);
        if ($request->hasFile('image_url')) {
            // Xoá ảnh cũ nếu có
            if ($category->image_url) {
                Storage::disk('public')->delete($category->image_url);
            }

            // Lưu ảnh mới
            $path = $request->file('image_url')->store('category', 'public');
            $validatedData['image_url'] = $path;
        }
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
     * @OA\Delete(
     *     path="/api/categories/{id}",
     *     summary="Xóa mềm danh mục theo id",
     *     tags={"Category"},
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
}
