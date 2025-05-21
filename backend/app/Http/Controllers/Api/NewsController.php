<?php

namespace App\Http\Controllers\Api;

use App\Models\news;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class NewsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
        $news = news::all();
        return response()->json([
            'message' => 'Lấy danh sách tin tức thành công',
            'data' => $news,
            'status' => 200,
        ])->setStatusCode(200, 'OK');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
        $news = news::find($id);
        if ($news) {
            return response()->json([
                'message' => 'Lấy thông tin thành công',
                'data' => $news,
                'status' => 200,
            ], 200);
        } else {
            return response()->json(['massage' => 'Không tìm thấy tin tức', 'satus' => false]);        
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
