<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use Cloudinary\Cloudinary;
use App\Models\SupportChat;
use Illuminate\Http\Request;
use App\Events\SupportChatSent;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Models\SupportChatAttachment;
use App\Models\SupportChatNotification;
use Illuminate\Support\Facades\Validator;


class ChatLiveController extends Controller
{
    //  user gửi tin nhắn (1 chiều)
    public function sendMessage(Request $request)
    {
        $user = Auth::user();
    
        if ($user->role !== 'customer') {
            return response()->json(['message' => 'Bạn không có quyền gửi tin nhắn.'], 403);
        }
    
        // Validate: Cho phép gửi message, ảnh, hoặc cả hai. Nếu cả hai đều rỗng thì báo lỗi.
        $request->validate([
            'message' => 'nullable|string',
            'attachments' => 'nullable',
            'attachments.*' => 'file|mimes:jpg,jpeg,png,gif,svg,pdf,docx,txt|max:4096'
        ]);
    
        if (
            (empty($request->message) || trim($request->message) === '')
            && !$request->hasFile('attachments')
        ) {
            return response()->json(['message' => 'Tin nhắn hoặc ảnh không được để trống.'], 422);
        }
    
        $chat = SupportChat::create([
            'customer_id' => $user->user_id,
            'sender' => 'customer',
            'message' => $request->message,
            'sent_at' => now(),
            'is_read' => false,
        ]);
    
        if ($request->hasFile('attachments')) {
            $cloudinary = app(Cloudinary::class);
            $files = $request->file('attachments');
            if (!is_array($files)) {
                $files = [$files];
            }
            foreach ($files as $file) {
                try {
                    $result = $cloudinary->uploadApi()->upload($file->getRealPath(), [
                        'folder' => 'chat_attachments'
                    ]);
                    if (isset($result['secure_url'])) {
                        SupportChatAttachment::create([
                            'chat_id' => $chat->chat_id,
                            'file_url' => $result['secure_url'],
                            'file_type' => $file->getClientMimeType(),
                        ]);
                    } else {
                        return response()->json(['message' => 'Upload file thất bại!'], 500);
                    }
                } catch (\Exception $e) {
                    return response()->json(['message' => 'Upload file thất bại!', 'error' => $e->getMessage()], 500);
                }
            }
        }
    
        $staffList = User::whereIn('role', ['admin', 'sale'])->pluck('user_id');
        foreach ($staffList as $staffId) {
            SupportChatNotification::create([
                'chat_id' => $chat->chat_id,
                'user_id' => $staffId,
                'is_read' => false,
            ]);
        }
    
        broadcast(new SupportChatSent($chat->load('attachments')))->toOthers();
    
        return response()->json([
            'success' => true,
            'chat' => $chat->load('attachments')
        ]);
    }


    //  (admin/sale) trả lời theo customer_id
    public function replyToCustomer(Request $request)
    {
        $staff = Auth::user();
        if (!in_array($staff->role, ['admin', 'sale'])) {
            return response()->json(['message' => 'Bạn không có quyền trả lời.'], 403);
        }

        $request->validate([
            'customer_id' => 'required|exists:users,user_id',
            'message' => 'nullable|string',
            // Cho phép gửi 1 file hoặc nhiều file
            'attachments' => 'nullable',
            'attachments.*' => 'file|mimes:jpg,jpeg,png,gif,svg,pdf,docx,txt|max:4096',
        ]);

        if (
            (empty($request->message) || trim($request->message) === '')
            && !$request->hasFile('attachments')
        ) {
            return response()->json(['message' => 'Tin nhắn hoặc ảnh không được để trống.'], 422);
        }

        $chat = SupportChat::create([
            'customer_id' => $request->customer_id,
            'staff_id' => $staff->user_id,
            'sender' => $staff->role,
            'message' => $request->message,
            'sent_at' => now(),
            'is_read' => false,
        ]);

        if ($request->hasFile('attachments')) {
            $cloudinary = app(Cloudinary::class);
            $files = $request->file('attachments');
            if (!is_array($files)) {
                $files = [$files];
            }
            foreach ($files as $file) {
                // Validate từng file nếu cần
                $validator = Validator::make(['file' => $file], [
                    'file' => 'file|mimes:jpg,jpeg,png,gif,svg,pdf,docx,txt|max:4096'
                ]);
                if ($validator->fails()) {
                    return response()->json(['message' => 'File không hợp lệ!'], 422);
                }
                try {
                    $result = $cloudinary->uploadApi()->upload($file->getRealPath(), [
                        'folder' => 'chat_attachments'
                    ]);
                    if (isset($result['secure_url'])) {
                        SupportChatAttachment::create([
                            'chat_id' => $chat->chat_id,
                            'file_url' => $result['secure_url'],
                            'file_type' => $file->getClientMimeType(),
                        ]);
                    } else {
                        return response()->json(['message' => 'Upload file thất bại!'], 500);
                    }
                } catch (\Exception $e) {
                    return response()->json(['message' => 'Upload file thất bại!', 'error' => $e->getMessage()], 500);
                }
            }
        }

        SupportChatNotification::create([
            'chat_id' => $chat->chat_id,
            'user_id' => $request->customer_id,
            'is_read' => false,
        ]);

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
    public function markAsRead($userId)
    {
        // $userId = Auth::id();
        // Đánh dấu tất cả tin nhắn chưa đọc của user này là đã đọc
        SupportChat::where('user_id', $userId)
            ->where('is_read', false)
            ->update(['is_read' => true]);

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
                // Lấy lại user theo customer_id để đảm bảo đúng role
                $customerUser = User::where('user_id', $customer->user_id)->first();

                $lastChat = SupportChat::where('customer_id', $customer->user_id)
                    ->orderBy('sent_at', 'desc')
                    ->first();

                $unreadCount = SupportChatNotification::where('user_id', $staff->user_id)
                    ->whereHas('chat', function ($q) use ($customer) {
                        $q->where('customer_id', $customer->user_id);
                    })
                    ->where('is_read', false)
                    ->count();

                $avatarUrl = $customer->image_url;

                return [
                    'customer_id' => $customer->user_id,
                    'role' => $customerUser ? $customerUser->role : null,
                    'customer_name' => $customer->username,
                    'customer_full_name' => $customer->full_name,
                    'avatar_url' => $avatarUrl,
                    'last_message' => isset($lastChat->message)
                        ? (($lastChat->sender !== 'customer') ? 'Bạn: ' . $lastChat->message : $lastChat->message)
                        : '',
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

    // đếm số tin nhắn chưa đọc theo từng id 
    public function getUnreadCountByCustomerId($customerId)
    {
        $staff = Auth::user();

        // Chỉ cho admin hoặc sale dùng
        if (!in_array($staff->role, ['admin', 'sale'])) {
            return response()->json(['message' => 'Bạn không có quyền truy cập.'], 403);
        }

        // Kiểm tra customer tồn tại
        $customer = User::where('user_id', $customerId)->where('role', 'customer')->first();
        if (!$customer) {
            return response()->json(['message' => 'Customer không tồn tại.'], 404);
        }

        // Đếm số tin nhắn chưa đọc từ customer này gửi đến staff hiện tại
        $unreadCount = SupportChatNotification::where('user_id', $staff->user_id)
            ->where('is_read', false)
            ->whereHas('chat', function ($query) use ($customerId) {
                $query->where('customer_id', $customerId);
            })
            ->count();

        return response()->json([
            'success' => true,
            'customer_id' => $customerId,
            'unread_count' => $unreadCount
        ]);
    }

    /**
     * Lấy public_id từ URL Cloudinary
     *
     * @param string $url URL của ảnh Cloudinary
     * @return string|null public_id hoặc null nếu không tìm thấy
     */
    private function getPublicIdFromUrl($url)
    {
        // URL Cloudinary có dạng: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/filename.jpg
        if (empty($url)) {
            return null;
        }

        // Tìm phần upload/ trong URL
        $pattern = '/\/upload\/(?:v\d+\/)?(.+)$/';
        if (preg_match($pattern, $url, $matches)) {
            // Loại bỏ phần mở rộng của file
            $publicId = preg_replace('/\.[^.]+$/', '', $matches[1]);
            return $publicId;
        }

        return null;
    }
}
