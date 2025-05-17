<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Banner;
use Illuminate\Support\Facades\Storage;

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
            // Xoá ảnh cũ nếu có
            if ($banner->image_url) {
                Storage::disk('public')->delete($banner->image_url);
            }

            // Lưu ảnh mới
            $path = $request->file('image_url')->store('banners', 'public');
            $validatedData['image_url'] = $path;
        }

        // Cập nhật dữ liệu
        $banner->update($validatedData);

        return response()->json(['message' => 'Cập nhật thành công', 'banner' => $banner]);
    }
}
