<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\LoyaltyPoint;
use App\Models\LoyaltyTier;
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
            $users = User::all();

            foreach ($users as $user) {
                $oldPoints = $user->loyalty_points;

                // Random % từ 30 đến 35
                $percent = rand(30, 35) / 100;

                // Tính điểm bị trừ
                $pointsToDeduct = (int) floor($oldPoints * $percent);

                // Điểm mới
                $newPoints = max(0, $oldPoints - $pointsToDeduct);

                // Cập nhật user
                $user->loyalty_points = $newPoints;
                $user->save();

                // Lưu lịch sử reset
                LoyaltyPoint::create([
                    'user_id'     => $user->user_id,
                    'points'      => -$pointsToDeduct, // số điểm bị trừ (âm)
                    'type'        => 'reset',
                    'description' => "Reset: trừ {$pointsToDeduct} điểm (từ {$oldPoints} xuống {$newPoints})",
                ]);
            }
        });

        return response()->json([
            'message' => 'Đã reset: tất cả user bị trừ ngẫu nhiên 30% - 35% điểm.'
        ]);
    }
}
