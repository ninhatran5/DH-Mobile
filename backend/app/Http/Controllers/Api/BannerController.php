<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Banner;

class BannerController extends Controller
{
    public function index() {
        $banners = Banner::all();
        return response()->json($banners);
    }

    
    public function show($id) {
        $banner = Banner::find($id);
        if ($banner) {
            return response()->json($banner);
        } else {
            return response()->json(['message' => 'Không tìm thấy Banner'], 404);
        }
    }
}
