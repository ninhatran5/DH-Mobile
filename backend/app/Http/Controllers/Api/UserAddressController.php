<?php

namespace App\Http\Controllers\Api;

use App\Models\UserAddress;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class UserAddressController extends Controller
{
    // Lấy danh sách địa chỉ của user
    public function index(Request $request)
    {
        $user = $request->user();
        $addresses = UserAddress::where('user_id', $user->user_id)->get();
        return response()->json([
            'status' => true,
            'data' => $addresses
        ]);
    }

    // Thêm địa chỉ mới cho user
    public function store(Request $request)
    {
        $request->validate([
            'recipient_name' => 'required|string|max:100',
            'phone' => 'required|string|max:15',
            'email' => 'nullable|email|max:100',
            'address' => 'required|string',
            'ward' => 'required|string|max:100',
            'district' => 'required|string|max:100',
            'city' => 'required|string|max:100',
            'is_default' => 'boolean'
        ]);

        $is_default = $request->input('is_default', false);
        $user_id = $request->user()->user_id;

        // Nếu là địa chỉ mặc định, cập nhật tất cả các địa chỉ khác thành không mặc định
        if ($is_default) {
            UserAddress::where('user_id', $user_id)
                ->update(['is_default' => false]);
        }

        $address = UserAddress::create([
            'user_id' => $user_id,
            'recipient_name' => $request->recipient_name,
            'phone' => $request->phone,
            'email' => $request->email,
            'address' => $request->address,
            'ward' => $request->ward,
            'district' => $request->district,
            'city' => $request->city,
            'is_default' => $is_default
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Địa chỉ được thêm thành công',
            'data' => $address
        ], 201);
    }

    // Cập nhật địa chỉ của user
    public function update(Request $request, $id)
    {
        $address = UserAddress::where('address_id', $id)
            ->where('user_id', $request->user()->user_id)
            ->first();

        if (!$address) {
            return response()->json([
                'status' => false,
                'message' => 'Không tìm thấy địa chỉ'
            ], 404);
        }

        $request->validate([
            'recipient_name' => 'string|max:100',
            'phone' => 'string|max:15',
            'email' => 'nullable|email|max:100',
            'address' => 'string',
            'ward' => 'string|max:100',
            'district' => 'string|max:100',
            'city' => 'string|max:100',
            'is_default' => 'boolean'
        ]);

        $is_default = $request->input('is_default', $address->is_default);
        $user_id = $request->user()->user_id;

        // Nếu là địa chỉ mặc định, cập nhật tất cả các địa chỉ khác thành không mặc định
        if ($is_default) {
            UserAddress::where('user_id', $user_id)
                ->where('address_id', '!=', $id)
                ->update(['is_default' => false]);
        }

        $address->update([
            'recipient_name' => $request->recipient_name ?? $address->recipient_name,
            'phone' => $request->phone ?? $address->phone,
            'email' => $request->email ?? $address->email,
            'address' => $request->address ?? $address->address,
            'ward' => $request->ward ?? $address->ward,
            'district' => $request->district ?? $address->district,
            'city' => $request->city ?? $address->city,
            'is_default' => $is_default
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Địa chỉ được cập nhật thành công',
            'data' => $address
        ]);
    }

    // Xóa địa chỉ của user
    public function destroy(Request $request, $id)
    {
        $address = UserAddress::where('address_id', $id)
            ->where('user_id', $request->user()->user_id)
            ->first();

        if (!$address) {
            return response()->json([
                'status' => false,
                'message' => 'Không tìm thấy địa chỉ'
            ], 404);
        }

        $address->delete();

        return response()->json([
            'status' => true,
            'message' => 'Địa chỉ đã được xóa'
        ]);
    }

    // Đặt địa chỉ làm mặc định
    public function setDefault(Request $request, $id)
    {
        $user_id = $request->user()->user_id;

        $address = UserAddress::where('address_id', $id)
            ->where('user_id', $user_id)
            ->first();

        if (!$address) {
            return response()->json([
                'status' => false,
                'message' => 'Không tìm thấy địa chỉ'
            ], 404);
        }

        // Cập nhật tất cả địa chỉ của user thành không mặc định
        UserAddress::where('user_id', $user_id)
            ->update(['is_default' => false]);

        // Đặt địa chỉ hiện tại làm mặc định
        $address->is_default = true;
        $address->save();

        return response()->json([
            'status' => true,
            'message' => 'Đã đặt địa chỉ làm mặc định',
            'data' => $address
        ]);
    }
}
