<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SupportChat;
use Illuminate\Http\Request;
use App\Events\SupportChatSent;
use App\Models\SupportChatAttachment;
use App\Models\SupportChatNotification;
use Illuminate\Support\Facades\Auth;

class SupportChatController extends Controller
{
    public function sendMessage(Request $request)
    {
        $request->validate([
            'customer_id' => 'required_without:staff_id|nullable|exists:users,user_id',
            'staff_id' => 'required_without:customer_id|nullable|exists:users,user_id',
            'message' => 'required|string',
            'sender' => 'required|in:customer,staff',
            'attachments.*' => 'file|mimes:jpg,png,pdf,docx,txt|max:2048'
        ]);

        // 1. Lưu tin nhắn
        $chat = SupportChat::create([
            'customer_id' => $request->customer_id,
            'staff_id' => $request->staff_id,
            'message' => $request->message,
            'sender' => $request->sender,
            'sent_at' => now(),
            'is_read' => false,
        ]);

        // 2. Lưu file đính kèm
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('chat_attachments', 'public');
                SupportChatAttachment::create([
                    'chat_id' => $chat->chat_id,
                    'file_path' => $path,
                    'file_type' => $file->getClientMimeType(),
                ]);
            }
        }

        // 3. Tạo notification cho người nhận
        $receiverId = $request->sender === 'customer' ? $chat->staff_id : $chat->customer_id;

        SupportChatNotification::create([
            'chat_id' => $chat->chat_id,
            'user_id' => $receiverId,
            'is_read' => false,
        ]);

        // 4. Gửi realtime qua Pusher
        broadcast(new SupportChatSent($chat->load('attachments')))->toOthers();

        return response()->json([
            'success' => true,
            'chat' => $chat->load('attachments'),
        ]);
    }
    // Lấy lịch sử chat giữa 2 user
    public function getChatHistory($userId)
    {
        $user = Auth::user();

        $chats = SupportChat::with('attachments')
            ->where(function ($q) use ($user, $userId) {
                $q->where('customer_id', $user->user_id)->where('staff_id', $userId);
            })
            ->orWhere(function ($q) use ($user, $userId) {
                $q->where('staff_id', $user->user_id)->where('customer_id', $userId);
            })
            ->orderBy('sent_at', 'asc')
            ->get();

        return response()->json($chats);
    }
    // Đếm số tin nhắn chưa đọc
    public function getUnreadCount()
    {
        $userId = Auth::id();

        $count = SupportChatNotification::where('user_id', $userId)
            ->where('is_read', false)
            ->count();

        return response()->json(['unread_count' => $count]);
    }

    // đã xem 
    public function markAsRead($chatId)
    {
        $userId = Auth::id();

        $noti = SupportChatNotification::where('chat_id', $chatId)
            ->where('user_id', $userId)
            ->first();

        if ($noti && !$noti->is_read) {
            $noti->update(['is_read' => true]);
        }

        return response()->json(['success' => true]);
    }
}
