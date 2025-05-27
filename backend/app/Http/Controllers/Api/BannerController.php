<?php

namespace App\Http\Controllers\Api;

use App\Models\Banner;
use Cloudinary\Cloudinary;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Storage;
// use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;



class BannerController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/getbanners",
     *     summary="Lấy toàn bộ danh sách banner",
     *     tags={"Banner"},
     *     @OA\Response(response=200, description="Thành công")
     * )
     */
    public function index()
    {
        $banners = Banner::all();
        return response()->json($banners);
    }


    /**
     * @OA\Get(
     *     path="/api/getbanners/{id}",
     *     summary="Lấy banner theo id",
     *     tags={"Banner"},
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
    public function show($id)
    {
        $banner = Banner::find($id);
        if ($banner) {
            return response()->json($banner);
        } else {
            return response()->json(['message' => 'Không tìm thấy Banner'], 404);
        }
    }


    /**
     * @OA\Post(
     *     path="/api/updatebanners/{id}",
     *     summary="Cập nhật banner theo id",
     *     tags={"Banner"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="title", type="string"),
     *             @OA\Property(property="link_url", type="string"),
     *             @OA\Property(property="image_url", type="string", format="binary"),
     *             @OA\Property(property="is_active", type="boolean")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Cập nhật thành công"),
     *     @OA\Response(response=404, description="Không tìm thấy")
     * )
     */
    public function update(Request $request, $id)
    {
        $banner = Banner::find($id);

        if (!$banner) {
            return response()->json(['message' => 'Không tìm thấy Banner'], 404);
        }

        // Validate dữ liệu (bạn có thể thêm các rule khác nếu muốn)
        $validatedData = $request->validate([
            'title' => 'nullable|string|max:255',
            'link_url' => 'nullable',
            'image_url' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'is_active' => 'nullable|boolean',
        ]);


        // Nếu có ảnh mới được upload
        if ($request->hasFile('image_url')) {
            try {
                // Lấy instance của Cloudinary
                $cloudinary = app(Cloudinary::class);

                // Xóa ảnh cũ nếu có
                if ($banner->image_url) {
                    // Lấy public_id từ URL
                    $oldImageUrl = $banner->image_url;
                    $publicId = $this->getPublicIdFromUrl($oldImageUrl);

                    if ($publicId) {
                        // Xóa ảnh cũ
                        $cloudinary->uploadApi()->destroy($publicId, [
                            'resource_type' => 'image'
                        ]);
                    }
                }

                // Upload ảnh mới lên Cloudinary sử dụng UploadApi
                $uploadApi = $cloudinary->uploadApi();
                $result = $uploadApi->upload($request->file('image_url')->getRealPath(), [
                    'folder' => 'banners'
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

        // Cập nhật dữ liệu
        $banner->update($validatedData);

        return response()->json(['message' => 'Cập nhật thành công', 'banner' => $banner]);
    }

    /**
     * Lấy public_id từ URL Cloudinary
     *
     * @param string $url URL của ảnh Cloudinary
     * @return string|null public_id hoặc null nếu không tìm thấy
     */
    private function getPublicIdFromUrl($url)
    {
        // URL Cloudinary có dạng: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/filename.jpg
        if (empty($url)) {
            return null;
        }

        // Tìm phần upload/ trong URL
        $pattern = '/\/upload\/(?:v\d+\/)?(.+)$/';
        if (preg_match($pattern, $url, $matches)) {
            // Loại bỏ phần mở rộng của file
            $publicId = preg_replace('/\.[^.]+$/', '', $matches[1]);
            return $publicId;
        }

        return null;
    }
}
