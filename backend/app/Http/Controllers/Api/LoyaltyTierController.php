<?php

namespace App\Http\Controllers\Api;

use App\Models\LoyaltyTier;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class LoyaltyTierController extends Controller
{
    public function index()
    {
        $LoyaltyTier = LoyaltyTier::orderBy('min_points')->get();

        if ($LoyaltyTier->isEmpty()) {
            return response()->json([
                'message' => 'Chưa có cấp bậc thành viên nào được tạo.',
            ]);
        }

        $LoyaltyTier = $LoyaltyTier->map(function ($tier) {
            $tier->discount_percent = rtrim(rtrim(number_format($tier->discount_percent, 2, '.', ''), '0'), '.') . '%';
            return $tier;
        });

        return response()->json([
            'message' => 'Danh sách cấp bậc thành viên',
            'data' => $LoyaltyTier
        ]);
    }

    public function update(Request $request, $id)
    {
        $tier = LoyaltyTier::find($id);
        if (!$tier) {
            return response()->json([
                'message' => 'Cấp bậc thành viên này không tồn tại.',
            ], 404);
        }

        $data = $request->validate([
            'min_points' => 'nullable|integer|min:0',
            'discount_percent' => 'nullable|numeric|min:0|max:100',
        ]);

        // Loại bỏ các trường có giá trị null để tránh lỗi NOT NULL
        $data = array_filter($data, function($value) {
            return !is_null($value);
        });

        $tier->update($data);

        return response()->json([
            'message' => 'Cập nhật cấp bậc thành viên thành công.',
            'data' => $tier
        ]);
    }
}
