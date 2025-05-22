<?php

namespace App\Http\Controllers\Api;

use App\Models\news;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Cloudinary\Cloudinary;


class NewsController extends Controller
{
    /**
     * Display a listing of the resource.
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
     * Store a newly created resource in storage.
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
     * Display the specified resource.
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
     * Update the specified resource in storage.
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
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
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
