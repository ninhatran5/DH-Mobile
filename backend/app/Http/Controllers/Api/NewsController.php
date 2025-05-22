<?php

namespace App\Http\Controllers\Api;

use App\Models\news;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Cloudinary\Cloudinary;


class NewsController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/news",
     *     summary="Lấy danh sách tin tức",
     *     tags={"News"},
     *     @OA\Response(response=200, description="Thành công")
     * )
     */
    public function index()
    {
        //
        $news = news::all();
        return response()->json([
            'message' => 'Lấy danh sách tin tức thành công',
            'data' => $news,
            'status' => 200,
        ])->setStatusCode(200, 'OK');
    }

    /**
     * @OA\Post(
     *     path="/api/news",
     *     summary="Thêm tin tức mới",
     *     tags={"News"},
     *     @OA\Response(response=201, description="Thành công")
     * )
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'image_url' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'is_active' => 'nullable|boolean',
        ]);
        if ($request->hasFile('image_url')) {
            try {
                $cloudinary = app(Cloudinary::class);
                $uploadApi = $cloudinary->uploadApi();
                $result = $uploadApi->upload($request->file('image_url')->getRealPath(), [
                    'folder' => 'news'
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
        $news = news::create($validatedData);
        return response()->json([
            'message' => 'Thêm tin tức thành công',
            'data' => $news,
            'status' => 201,
        ])->setStatusCode(201, 'Created');
    }

    /**
     * @OA\Get(
     *     path="/api/news/{id}",
     *     summary="Lấy chi tiết tin tức",
     *     tags={"News"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Thành công")
     * )
     */
    public function show(string $id)
    {
        //
        $news = news::find($id);
        if ($news) {
            return response()->json([
                'message' => 'Lấy thông tin thành công',
                'data' => $news,
                'status' => 200,
            ], 200);
        } else {
            return response()->json(['massage' => 'Không tìm thấy tin tức', 'satus' => false]);
        }
    }

    /**
     * @OA\Put(
     *     path="/api/news/{id}",
     *     summary="Cập nhật tin tức",
     *     tags={"News"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Thành công")
     * )
     */
    public function update(Request $request, $id)
    {
        $news = news::find($id);
        if (!$news) {
            return response()->json([
                'message' => 'Tin tức không tồn tại',
                'status' => 404,
            ], 404);
        }
        $validatedData = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'image_url' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'is_active' => 'nullable|boolean',
        ]);
        if ($request->hasFile('image_url')) {
            try {
                $cloudinary = app(Cloudinary::class);
                if ($news->image_url) {
                    $oldImageUrl = $news->image_url;
                    $publicId = $this->getPublicIdFromUrl($oldImageUrl);
                    if ($publicId) {
                        $cloudinary->uploadApi()->destroy($publicId, [
                            'resource_type' => 'image'
                        ]);
                    }
                }
                $uploadApi = $cloudinary->uploadApi();
                $result = $uploadApi->upload($request->file('image_url')->getRealPath(), [
                    'folder' => 'news'
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
        $news->update($validatedData);
        return response()->json([
            'message' => 'Cập nhật tin tức thành công',
            'data' => $news,
            'status' => 200,
        ]);
    }

    /**
     * @OA\Delete(
     *     path="/api/news/{id}",
     *     summary="Xóa mềm tin tức",
     *     tags={"News"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Thành công")
     * )
     */
    public function destroy(string $id)
    {
        $news = news::find($id);
        if (!$news) {
            return response()->json([
                'message' => 'Tin tức không tồn tại',
                'status' => 404,
            ], 404);
        }
        // Xóa ảnh trên Cloudinary nếu có
        if ($news->image_url) {
            try {
                $cloudinary = app(Cloudinary::class);
                $publicId = $this->getPublicIdFromUrl($news->image_url);
                if ($publicId) {
                    $cloudinary->uploadApi()->destroy($publicId, [
                        'resource_type' => 'image'
                    ]);
                }
            } catch (\Exception $e) {
                // Có thể log lỗi hoặc bỏ qua nếu không cần thiết
            }
        }
        $news->delete();
        return response()->json([
            'message' => 'Đã bỏ vào thùng rác thành công',
            'status' => 200,
        ])->setStatusCode(200, 'OK');
    }
    /**
     * @OA\Post(
     *     path="/api/news/restore/{id}",
     *     summary="Khôi phục tin tức đã xóa mềm",
     *     tags={"News"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Thành công")
     * )
     */
    public function restore($id)
    {
        $news = news::withTrashed()->find($id);
        if (!$news) {
            return response()->json([
                'message' => 'Tin tức không tồn tại',
                'status' => 404,
            ], 404);
        }
        $news->restore();
        return response()->json([
            'message' => 'Khôi phục tin tức thành công',
            'data' => $news,
            'status' => 200,
        ])->setStatusCode(200, 'OK');
    }

    /**
     * @OA\Get(
     *     path="/api/news/trashed",
     *     summary="Lấy danh sách tin tức đã xóa mềm",
     *     tags={"News"},
     *     @OA\Response(response=200, description="Thành công")
     * )
     */
    public function trashed()
    {
        $deletedNews = news::onlyTrashed()->orderBy('deleted_at', 'DESC')->get();

        if ($deletedNews->isEmpty()) {
            return response()->json([
                'message' => 'Không tìm thấy tin tức đã xóa mềm',
                'data' => [],
                'status' => 404,
            ], 404);
        }

        return response()->json([
            'message' => 'Lấy danh sách tin tức đã xóa (mềm) thành công',
            'data' => $deletedNews,
            'status' => 200,
        ], 200);
    }

    /**
     * @OA\Delete(
     *     path="/api/news/force-delete/{id}",
     *     summary="Xóa vĩnh viễn tin tức",
     *     tags={"News"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Thành công")
     * )
     */
    public function forceDelete($id)
    {
        $news = news::withTrashed()->find($id);
        if (!$news) {
            return response()->json([
                'message' => 'Tin tức không tồn tại',
                'status' => 404,
            ], 404);
        }
        // Xóa ảnh trên Cloudinary nếu có
        if ($news->image_url) {
            try {
                $cloudinary = app(Cloudinary::class);
                $publicId = $this->getPublicIdFromUrl($news->image_url);
                if ($publicId) {
                    $cloudinary->uploadApi()->destroy($publicId, [
                        'resource_type' => 'image'
                    ]);
                }
            } catch (\Exception $e) {
                // Có thể log lỗi hoặc bỏ qua nếu không cần thiết
            }
        }
        $news->forceDelete();
        return response()->json([
            'message' => 'Xóa vĩnh viễn tin tức thành công',
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
