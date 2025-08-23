<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ReturnNotification;
use Illuminate\Http\Request;

class ReturnNotificationController extends Controller
{
    // Lấy danh sách thông báo (ví dụ cho admin)
    public function index()
    {
        $notifications = ReturnNotification::orderBy('created_at', 'desc')->get();
        return response()->json($notifications);
    }

    // Đánh dấu đã đọc
    public function markAsRead($id)
    {
        $notification = ReturnNotification::find($id);

        if (!$notification) {
            return response()->json(['message' => 'Không tìm thấy thông báo'], 404);
        }

        $notification->update(['is_read' => true]);

        return response()->json(['message' => 'Đã đánh dấu là đã đọc']);
    }
}
