<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OrderNotification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    // Lấy danh sách thông báo mới nhất
    public function index()
    {
        $notifications = OrderNotification::latest('created_at')
            ->limit(20)
            ->get();

        return response()->json([
            'status' => true,
            'message' => 'Danh sách thông báo',
            'data' => $notifications
        ]);
    }

    // Đánh dấu đã đọc
    public function markAsRead(Request $request)
    {
        $ids = $request->input('ids', []); // mảng notification_id

        OrderNotification::whereIn('notification_id', $ids)->update(['is_read' => true]);

        return response()->json([
            'status' => true,
            'message' => 'Đã đánh dấu đã đọc'
        ]);
    }
}

