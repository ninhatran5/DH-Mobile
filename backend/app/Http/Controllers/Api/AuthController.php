<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use Cloudinary\Cloudinary;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Mail\ResetPasswordMail;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\PersonalAccessToken;


/**
 *    @OA\Info(
 *    title="APIs For DH Mobile ",
 *    version="1.0.0",
 *    ),
 *    @OA\SecurityScheme(
 *   securityScheme="bearerAuth",
 *    in="header",
 *    name="bearerAuth",
 *    type="http",
 *    scheme="bearer",
 *    bearerFormat="JWT",
 *    ),
 */
class AuthController extends Controller
{

    /**
     * @OA\Post(
     *     path="/api/login",
     *     summary="Đăng nhập",
     *     tags={"Auth"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email","password"},
     *             @OA\Property(property="email", type="string", format="email"),
     *             @OA\Property(property="password", type="string", format="password")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Đăng nhập thành công"),
     *     @OA\Response(response=401, description="Sai thông tin đăng nhập")
     * )
     */
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

    /**
     * @OA\Post(
     *     path="/api/logout",
     *     summary="Đăng xuất",
     *     tags={"Auth"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Đăng xuất thành công")
     * )
     */
    public function logout(Request $request)
    {
        // Xóa token hiện tại
        $user = $request->user();

        $user->currentAccessToken()->delete(); // xoá token hiện tại

        return response()->json([
            'message' => 'Đăng xuất thành công.',
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/register",
     *     summary="Đăng ký tài khoản mới",
     *     tags={"Auth"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"username","full_name","email","password"},
     *             @OA\Property(property="username", type="string"),
     *             @OA\Property(property="full_name", type="string"),
     *             @OA\Property(property="email", type="string", format="email"),
     *             @OA\Property(property="password", type="string", format="password"),
     *             @OA\Property(property="phone", type="string"),
     *             @OA\Property(property="address", type="string")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Đăng ký thành công")
     * )
     */
    public function register(Request $request)
    {
        // Validate dữ liệu đầu vào
        $request->validate([
            'username' => 'required|string|max:255|unique:users,username',
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => [
                'required',
                'string',
                'min:8',
                'max:28',
                'regex:/^(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,28}$/'
            ],
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
            ]
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/forgot-password",
     *     summary="Gửi email đặt lại mật khẩu",
     *     tags={"Auth"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email"},
     *             @OA\Property(property="email", type="string", format="email")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Gửi email thành công"),
     *     @OA\Response(response=404, description="Email không tồn tại")
     * )
     */
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

    /**
     * @OA\Post(
     *     path="/api/resetpassword",
     *     summary="Đặt lại mật khẩu mới",
     *     tags={"Auth"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"token","password","password_confirmation"},
     *             @OA\Property(property="token", type="string"),
     *             @OA\Property(property="password", type="string", format="password"),
     *             @OA\Property(property="password_confirmation", type="string", format="password")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Đặt lại mật khẩu thành công"),
     *     @OA\Response(response=400, description="Token không hợp lệ hoặc đã hết hạn"),
     *     @OA\Response(response=404, description="Email không tồn tại")
     * )
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
            'password' => [
                'required',
                'string',
                'min:8',
                'max:28',
                'regex:/^(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,28}$/'
            ],
            'password_confirmation' => 'required|same:password',
        ]);

        // Kiểm tra token hợp lệ
        $reset = DB::table('password_resets')->where('token', $request->token)->first();
        if (!$reset) {
            return response()->json([
                'message' => 'Token không hợp lệ hoặc đã hết hạn.',
            ], 400);
        }

        // Lấy user theo email trong password_resets
        $user = User::where('email', $reset->email)->first();
        if (!$user) {
            return response()->json([
                'message' => 'Email không tồn tại.',
            ], 404);
        }

        // Kiểm tra mật khẩu mới không trùng với mật khẩu cũ
        if (Hash::check($request->password, $user->password_hash)) {
            return response()->json([
                'message' => 'Mật khẩu mới không được trùng với mật khẩu cũ.',
            ], 400);
        }

        $user->password_hash = Hash::make($request->password);
        $user->save();

        // Xoá token sau khi reset thành công
        DB::table('password_resets')->where('email', $user->email)->delete();

        return response()->json([
            'message' => 'Mật khẩu đã được đổi thành công.',
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/refresh",
     *     summary="Làm mới token",
     *     tags={"Auth"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Token đã được làm mới thành công",
     *         @OA\JsonContent(
     *             @OA\Property(property="access_token", type="string"),
     *             @OA\Property(property="token_type", type="string"),
     *             @OA\Property(property="user", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Token không hợp lệ hoặc đã hết hạn"
     *     )
     * )
     */
    public function refreshToken(Request $request)
    {
        try {
            $oldToken = $request->input('Token');
            if (!$oldToken) {
                return response()->json([
                    'message' => 'Vui lòng truyền Token.'
                ], 400);
            }

            // Tìm PersonalAccessToken theo token cũ
            $tokenModel = PersonalAccessToken::findToken($oldToken);
            if (!$tokenModel) {
                return response()->json([
                    'message' => 'Token không hợp lệ hoặc đã hết hạn.'
                ], 401);
            }

            $user = $tokenModel->tokenable;

            // Xoá token cũ
            $tokenModel->delete();

            // Tạo token mới
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'Token đã được làm mới thành công.',
                'Token' => $token,
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
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Có lỗi xảy ra khi làm mới token.'
            ], 500);
        }
    }
}
