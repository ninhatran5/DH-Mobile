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
    public function markAsRead($notification_id)
    {
        $notification = OrderNotification::find($notification_id);
        if (!$notification) {
            return response()->json([
                'status' => false,
                'message' => 'Không tìm thấy thông báo',
            ], 404);
        }
        $notification->is_read = 1;
        $notification->save();

        return response()->json([
            'status' => true,
            'message' => 'Đã đánh dấu đã đọc',
            'notification' =>  $notification
        ]);
    }

    public function markAsReadAll(Request $request)
    {
        $affected = OrderNotification::where('is_read', 0)->update(['is_read' => 1]);
        return response()->json([
            'status' => true,
            'message' => 'Đã đánh dấu tất cả thông báo là đã đọc',
            'affected' => $affected
        ]);
    }
}

