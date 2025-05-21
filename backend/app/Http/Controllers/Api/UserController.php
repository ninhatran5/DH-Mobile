<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use Cloudinary\Cloudinary;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;


class UserController extends Controller
{
    public function getuser(Request $request)
    {
        $user = User::all();
        return response()->json([
            'message' => 'Lấy thông tin người dùng thành công.',
            'user' =>  $user
        ]);
    }


    public function profile(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'user' => [
                'id' => $user->user_id,
                'username' => $user->username,
                'full_name' => $user->full_name,
                'email' => $user->email,
                'phone' => $user->phone,
                'address' => $user->address,
                'ward' => $user->ward,
                'district' => $user->district,
                'city' => $user->city,
                'image_url' => $user->image_url,
                'role' => $user->role,
            ]
        ]);
    }


    public function updateProfile(Request $request)
    {
        $user = $request->user();
        $validatedData = $request->validate([
            'username' => 'nullable|string|max:50',
            'full_name' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:15',
            'address' => 'nullable|string|max:255',
            'ward' => 'string|max:100',
            'district' => 'string|max:100',
            'city' => 'string|max:100',
            'image_url' => 'nullable|image|max:2048', // giới hạn 2MB
        ]);

        // Nếu có ảnh mới được upload
        if ($request->hasFile('image_url')) {
            try {
                $cloudinary = app(Cloudinary::class);
                // Xoá ảnh cũ nếu có
                if ($user->image_url) {
                    $publicId = $this->getPublicIdFromUrl($user->image_url);
                    if ($publicId) {
                        $cloudinary->uploadApi()->destroy($publicId, ['resource_type' => 'image']);
                    }
                }
                // Upload ảnh mới
                $uploadApi = $cloudinary->uploadApi();
                $result = $uploadApi->upload($request->file('image_url')->getRealPath(), [
                    'folder' => 'users'
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

        $user->update($validatedData);

        return response()->json([
            'message' => 'Cập nhật thành công.',
            'user' => $user
        ]);
    }
    /**
     * Lấy public_id từ URL Cloudinary
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
