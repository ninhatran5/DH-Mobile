<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Banner;
use Illuminate\Support\Facades\Storage;

class BannerController extends Controller
{
    public function index()
    {
        $banners = Banner::all();
        return response()->json($banners);
    }


    public function show($id)
    {
        $banner = Banner::find($id);
        if ($banner) {
            return response()->json($banner);
        } else {
            return response()->json(['message' => 'Không tìm thấy Banner'], 404);
        }
    }


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
