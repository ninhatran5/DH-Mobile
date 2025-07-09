<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SupportChat;
use Illuminate\Http\Request;
use App\Events\SupportChatSent;
use App\Models\SupportChatAttachment;
use App\Models\SupportChatNotification;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class ChatLiveController extends Controller
{
    //  user gửi tin nhắn (1 chiều)
    public function sendMessage(Request $request)
    {
        $request->validate([
            'message' => 'required|string',
            'attachments.*' => 'file|mimes:jpg,png,pdf,docx,txt|max:2048'
        ]);

        $user = Auth::user();
        if ($user->role !== 'customer') {
            return response()->json(['message' => 'Bạn không có quyền gửi tin nhắn.'], 403);
        }

        $chat = SupportChat::create([
            'customer_id' => $user->user_id,
            'sender' => 'customer',
            'message' => $request->message,
            'sent_at' => now(),
            'is_read' => false,
        ]);

        // File đính kèm
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

        // Gửi noti đến tất cả staff
        $staffList = User::whereIn('role', ['admin', 'sale'])->pluck('user_id');
        foreach ($staffList as $staffId) {
            SupportChatNotification::create([
                'chat_id' => $chat->chat_id,
                'user_id' => $staffId,
                'is_read' => false,
            ]);
        }
        // realtime 
        broadcast(new SupportChatSent($chat->load('attachments')))->toOthers();

        return response()->json(['success' => true, 'chat' => $chat->load('attachments')]);
    }

    //  (admin/sale) trả lời theo customer_id
    public function replyToCustomer(Request $request)
    {
        // 1. Validate input
        $request->validate([
            'customer_id' => 'required|exists:users,user_id',
            'message' => 'required|string',
            'attachments.*' => 'file|mimes:jpg,png,pdf,docx,txt|max:2048'
        ]);

        // 2. Lấy user hiện tại và kiểm tra quyền
        $staff = Auth::user();
        if (!in_array($staff->role, ['admin', 'sale'])) {
            return response()->json(['message' => 'Bạn không có quyền trả lời.'], 403);
        }

        // 3. Tạo tin nhắn mới
        $chat = SupportChat::create([
            'customer_id' => $request->customer_id,
            'staff_id' => $staff->user_id,
            'sender' => $staff->role, // ✅ dùng role 'admin' hoặc 'sale'
            'message' => $request->message,
            'sent_at' => now(),
            'is_read' => false,
        ]);

        // 4. Lưu file đính kèm nếu có
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

        // 5. Tạo thông báo cho user (customer)
        SupportChatNotification::create([
            'chat_id' => $chat->chat_id,
            'user_id' => $request->customer_id,
            'is_read' => false,
        ]);

        // 6. Gửi realtime qua Pusher
        broadcast(new SupportChatSent($chat->load('attachments')))->toOthers();

        return response()->json([
            'success' => true,
            'chat' => $chat->load('attachments'),
        ]);
    }

    // Lấy lịch sử giữa customer và staff (2 chiều)
    public function getChatHistory($customerId)
    {
        $user = Auth::user();

        //  Chỉ customer chính chủ hoặc nhân viên mới được xem
        if ($user->role === 'customer' && $user->user_id != $customerId) {
            return response()->json(['message' => 'Không được phép truy cập lịch sử này.'], 403);
        }

        //  Lấy toàn bộ tin nhắn liên quan đến customer này
        $chats = SupportChat::with('attachments')
            ->where('customer_id', $customerId)
            ->orderBy('sent_at', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'chats' => $chats
        ]);
    }

    //  Đếm số tin nhắn chưa đọc
    public function getUnreadCount()
    {
        $userId = Auth::id();

        $count = SupportChatNotification::where('user_id', $userId)
            ->where('is_read', false)
            ->count();

        return response()->json([
            'success' => true,
            'unread_count' => $count
        ]);
    }

    //  Đánh dấu một tin nhắn là đã đọc
    public function markAsRead($chatId)
    {
        $userId = Auth::id();

        $notification = SupportChatNotification::where('chat_id', $chatId)
            ->where('user_id', $userId)
            ->first();

        if ($notification && !$notification->is_read) {
            $notification->update(['is_read' => true]);
        }

        return response()->json(['success' => true]);
    }
    // danh sách user nhắn tin cho admin và sale
    public function getCustomersChatList()
    {
        $staff = Auth::user();

        // Kiểm tra quyền truy cập (chỉ admin hoặc sale mới được xem danh sách này)
        if (!in_array($staff->role, ['admin', 'sale'])) {
            return response()->json(['message' => 'Bạn không có quyền truy cập danh sách này.'], 403);
        }

        // Lấy danh sách ID của các customer đã từng gửi tin nhắn
        $customerIds = SupportChat::where('sender', 'customer')
            ->select('customer_id')
            ->distinct()
            ->pluck('customer_id');

        // Lấy thông tin chi tiết từng customer
        $customers = User::whereIn('user_id', $customerIds)
            ->get()
            ->map(function ($customer) use ($staff) {
                // Lấy tin nhắn cuối cùng giữa customer và staff bất kỳ
                $lastChat = SupportChat::where('customer_id', $customer->user_id)
                    ->orderBy('sent_at', 'desc')
                    ->first();

                // Đếm số tin nhắn chưa đọc của nhân viên này từ customer đó
                $unreadCount = SupportChatNotification::where('user_id', $staff->user_id)
                    ->whereHas('chat', function ($q) use ($customer) {
                        $q->where('customer_id', $customer->user_id);
                    })
                    ->where('is_read', false)
                    ->count();

                // Xử lý ảnh đại diện
                $avatarUrl = $customer->image_url;

                return [
                    'customer_id' => $customer->user_id,
                    'customer_name' => $customer->full_name ?? $customer->username,
                    'avatar_url' => $avatarUrl,
                    'last_message' => $lastChat->message ?? '',
                    'last_message_time' => $lastChat->sent_at ?? null,
                    'unread_count' => $unreadCount,
                ];
            })
            ->sortByDesc('last_message_time') // ✅ Sắp xếp theo người nhắn gần nhất
            ->values(); // ✅ Reset lại index của mảng

        return response()->json([
            'success' => true,
            'customers' => $customers,
        ]);
    }
}
