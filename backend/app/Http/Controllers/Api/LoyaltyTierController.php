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
}
