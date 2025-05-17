<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use App\Mail\ResetPasswordMail;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        // Validate dữ liệu đầu vào
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        // Tìm user theo email
        $user = User::where('email', $request->email)->first();

        // Kiểm tra mật khẩu
        if (!$user || !Hash::check($request->password, $user->password_hash)) {
            return response()->json([
                'message' => 'Email hoặc mật khẩu không đúng.',
            ], 401);
        }

        // Tạo token mới
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => [
                'id' => $user->user_id,
                'username' => $user->username,
                'full_name' => $user->full_name,
                'email' => $user->email,
                'phone' => $user->phone,
                'address' => $user->address,
                'role' => $user->role,
            ]
        ]);
    }

    public function logout(Request $request)
    {
        // Xóa token hiện tại
        $user = $request->user();

        $user->currentAccessToken()->delete(); // xoá token hiện tại

        return response()->json([
            'message' => 'Đăng xuất thành công.',
        ]);
    }

    public function register(Request $request)
    {
        // Validate dữ liệu đầu vào
        $request->validate([
            'username' => 'required|string|max:255',
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'phone' => 'nullable|string|max:15',
            'address' => 'nullable|string|max:255',
        ]);

        // Tạo user mới
        $user = User::create([
            'username' => $request->username,
            'full_name' => $request->full_name,
            'email' => $request->email,
            'password_hash' => Hash::make($request->password),
            'phone' => $request->phone,
            'address' => $request->address,
        ]);

        return response()->json([
            'message' => 'Đăng ký thành công.',
            'user' => [
                'id' => $user->user_id,
                'username' => $user->username,
                'full_name' => $user->full_name,
                'email' => $user->email,
                'role' => $user->role,
            ]
        ]);
    }


    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'message' => 'Email không tồn tại.',
            ], 404);
        }

        // Tạo token
        $token = Str::random(60);

        // Lưu token vào bảng password_resets
        DB::table('password_resets')->updateOrInsert(
            ['email' => $user->email],
            [
                'token' => $token,
                'created_at' => now(),
            ]
        );

        // Gửi mail
        Mail::to($user->email)->send(new ResetPasswordMail($user, $token));

        return response()->json([
            'message' => 'Đã gửi email đặt lại mật khẩu.',
        ]);
    }
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);
        $reset = DB::table('password_resets')
            ->where('email', $request->email)
            ->where('token', $request->token)
            ->first();
        if (!$reset) {
            return response()->json([
                'message' => 'Token không hợp lệ hoặc đã hết hạn.',
            ], 400);
        }
        // Cập nhật mật khẩu
        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json([
                'message' => 'Email không tồn tại.',
            ], 404);
        }
        $user->password_hash = Hash::make($request->password);
        $user->save();
        // Xóa token
        DB::table('password_resets')->where('email', $request->email)->delete();
        return response()->json([
            'message' => 'Mật khẩu đã được đặt lại thành công.',
        ]);
    }
}
