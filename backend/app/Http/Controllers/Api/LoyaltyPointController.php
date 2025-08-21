<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\LoyaltyPoint;
use Illuminate\Support\Facades\DB;

class LoyaltyPointController extends Controller
{
    /**
     * Lấy lịch sử điểm của người dùng đang đăng nhập
     */
    public function index(Request $request)
    {
        $user = $request->user(); // user đang đăng nhập

        return response()->json([
            'total_points' => $user->total_points,
            'history' => $user->loyaltyPoints()->latest()->get()
        ]);
    }

    /**
     * Lấy tổng điểm tích lũy hiện tại của user
     */
    public function summary(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'total_points' => $user->total_points
        ]);
    }

    /**
     * Reset toàn bộ điểm tích lũy của tất cả người dùng về 0.
     * Chỉ cho phép admin gọi (được bảo vệ bởi middleware CheckAdmin ở routes).
     */
    public function resetAll(Request $request)
    {
        DB::transaction(function () {
            // Xóa lịch sử tích điểm chi tiết
            LoyaltyPoint::query()->delete();
            // Đặt lại cột tổng điểm đã cache trên bảng users
            User::query()->update(['loyalty_points' => 0]);
        });

        return response()->json([
            'message' => 'Đã reset điểm của tất cả người dùng về 0.'
        ]);
    }
}
