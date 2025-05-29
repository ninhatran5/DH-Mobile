<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Cloudinary\Cloudinary;
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
        $validatedData = $request->validate([
            'name' => 'required|string|max:200',
            'description' => 'nullable|string|max:255',
            'image_url' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);
        // Kiểm tra tên danh mục đã tồn tại chưa (không phân biệt hoa thường)
        if (Category::whereRaw('LOWER(name) = ?', [strtolower($validatedData['name'])])->exists()) {
            return response()->json([
                'message' => 'Tên danh mục đã tồn tại',
                'status' => 422,
            ], 422);
        }
        // Nếu có ảnh upload thì upload lên Cloudinary
        if ($request->hasFile('image_url')) {
            try {
                $cloudinary = app(Cloudinary::class);
                $uploadApi = $cloudinary->uploadApi();
                $result = $uploadApi->upload($request->file('image_url')->getRealPath(), [
                    'folder' => 'categories'
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

        $category = Category::create($validatedData);
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
    public function update(Request $request, $id)
    {
        $category = Category::find($id);
        if (!$category) {
            return response()->json([
                'message' => 'Danh mục không tồn tại',
                'status' => 404,
            ], 404);
        }
        $validatedData = $request->validate([
            'name' => 'required|string|max:200',
            'description' => 'nullable|string|max:255',
            'image_url' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);
        // Nếu có ảnh mới được upload
        if ($request->hasFile('image_url')) {
            try {
                $cloudinary = app(Cloudinary::class);
                // Xóa ảnh cũ nếu có
                if ($category->image_url) {
                    $oldImageUrl = $category->image_url;
                    $publicId = $this->getPublicIdFromUrl($oldImageUrl);
                    if ($publicId) {
                        $cloudinary->uploadApi()->destroy($publicId, [
                            'resource_type' => 'image'
                        ]);
                    }
                }
                // Upload ảnh mới lên Cloudinary
                $uploadApi = $cloudinary->uploadApi();
                $result = $uploadApi->upload($request->file('image_url')->getRealPath(), [
                    'folder' => 'categories'
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
        $category->update($validatedData);
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
    /**
     * @OA\Get(
     *     path="/api/categories/trashed",
     *     summary="Lấy danh sách danh mục đã xóa mềm",
     *     tags={"Category"},
     *     @OA\Response(response=200, description="Thành công")
     * )
     */
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
    /**
     * @OA\Post(
     *     path="/api/categories/restore/{id}",
     *     summary="Khôi phục danh mục đã xóa mềm",
     *     tags={"Category"},
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
    /**
     * @OA\Delete(
     *     path="/api/categories/force-delete/{id}",
     *     summary="Xóa vĩnh viễn danh mục đã xóa mềm",
     *     tags={"Category"},
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
