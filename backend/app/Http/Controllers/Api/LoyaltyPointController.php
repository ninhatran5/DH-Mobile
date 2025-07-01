<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

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
}
