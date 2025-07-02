<?php

namespace App\Http\Controllers\Api;

use App\Models\LoyaltyTier;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class LoyaltyTierController extends Controller
{
    public function index()
    {
        return response()->json([
            'message' => 'Danh sách cấp bậc thành viên',
            'data' => LoyaltyTier::orderBy('min_points')->get()
        ]);
    }
}
