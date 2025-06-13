<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use Cloudinary\Cloudinary;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;


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

    public function createuser(Request $request)
    {
        $validatedData = $request->validate([
            'username' => [
                'required',
                'string',
                'max:50',
                'regex:/^[a-zA-Z0-9_]+$/',
                'unique:users,username'
            ],
            'full_name' => [
                'required',
                'string',
                'max:100',
                'regex:/^[\pL\s\-]+$/u',
                'unique:users,full_name'
            ],
            'email' => 'required|email|unique:users,email',
            'password' => [
                'required',
                'string',
                'min:8',
                'max:28',
                'regex:/^(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,28}$/'
            ],
            'phone' => [
                'nullable',
                'string',
                'max:15',
                'regex:/^(\+?\d{9,15})$/'
            ],
            'address' => 'nullable|string|max:255',
            'ward' => 'string|max:100',
            'district' => 'string|max:100',
            'city' => 'string|max:100',
            'image_url' => 'nullable|image|max:2048', // giới hạn 2MB
            'role' => 'required|in:admin,customer,sale,shipper,checker', // Chỉ cho phép giá trị 'admin' hoặc 'user'
        ]);

        if ($request->hasFile('image_url')) {
            try {
                $cloudinary = app(Cloudinary::class);
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

        $user = User::create([
            'username' => $validatedData['username'],
            'full_name' => $validatedData['full_name'],
            'email' => $validatedData['email'],
            'password_hash' => Hash::make($validatedData['password']),
            'phone' => $validatedData['phone'],
            'address' => $validatedData['address'],
            'ward' => $validatedData['ward'],
            'district' => $validatedData['district'],
            'city' => $validatedData['city'],
            'image_url' => $validatedData['image_url'] ?? null,
            'role' => $validatedData['role'],
        ]);

        return response()->json([
            'message' => 'Tạo người dùng thành công.',
            'user' => $user
        ]);
    }


    public function getuserbyid($id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json([
                'message' => 'Người dùng không tồn tại.'
            ], 404);
        }
        return response()->json([
            'message' => 'Lấy thông tin người dùng thành công.',
            'user' => $user
        ]);
    }



    public function updateuser(Request $request, $id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json([
                'message' => 'Người dùng không tồn tại.'
            ], 404);
        }

        $validatedData = $request->validate([
            'username' => [
                'nullable',
                'string',
                'max:50',
                'regex:/^[a-zA-Z0-9_]+$/',
                'unique:users,username,' . $user->user_id . ',user_id'
            ],
            'full_name' => [
                'nullable',
                'string',
                'max:100',
                'regex:/^[\pL\s\-]+$/u',
                'unique:users,full_name,' . $user->user_id . ',user_id'
            ],
            'email' => 'nullable|email|unique:users,email,' . $user->user_id . ',user_id',
            'phone' => [
                'nullable',
                'string',
                'max:15',
                'regex:/^(\+?\d{9,15})$/'
            ],
            'address' => 'nullable|string|max:255',
            'ward' => 'nullable|string|max:100',
            'district' => 'nullable|string|max:100',
            'city' => 'nullable|string|max:100',
            'image_url' => 'nullable|image|max:5048', // giới hạn 2MB
        ]);

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
            'message' => 'Cập nhật người dùng thành công.',
            'user' => $user
        ]);
    }

    /**
     * Xoá mềm người dùng
     */
    public function deleteuser($id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json([
                'message' => 'Người dùng không tồn tại.'
            ], 404);
        }

        // // Xoá ảnh cũ nếu có
        // if ($user->image_url) {
        //     $publicId = $this->getPublicIdFromUrl($user->image_url);
        //     if ($publicId) {
        //         $cloudinary = app(Cloudinary::class);
        //         $cloudinary->uploadApi()->destroy($publicId, ['resource_type' => 'image']);
        //     }
        // }

        $user->delete();

        return response()->json([
            'message' => 'Xóa người dùng thành công.'
        ]);
    }


    public function trashuser()
    {
        $user = User::onlyTrashed()->get();
        return response()->json([
            'message' => 'Lấy danh sách người dùng đã xóa thành công.',
            'user' => $user
        ]);
    }



    public function restoreuser($id)
    {
        $user = User::onlyTrashed()->find($id);
        if (!$user) {
            return response()->json([
                'message' => 'Người dùng không tồn tại.'
            ], 404);
        }

        $user->restore();

        return response()->json([
            'message' => 'Khôi phục người dùng thành công.',
            'user' => $user
        ]);
    }


    public function forceDeleteuser($id) {
        $user = User::onlyTrashed()->find($id);
        if (!$user) {
            return response()->json([
                'message' => 'Người dùng không tồn tại.'
            ], 404);
        }
        // Xoá ảnh cũ nếu có
        if ($user->image_url) {
            $publicId = $this->getPublicIdFromUrl($user->image_url);
            if ($publicId) {
                $cloudinary = app(Cloudinary::class);
                $cloudinary->uploadApi()->destroy($publicId, ['resource_type' => 'image']);
            }
        }

        $user->forceDelete();

        return response()->json([
            'message' => 'Xóa vĩnh viễn người dùng thành công.'
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
