<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('chat.user.{userId}', function ($user, $userId) {
    return (int) $user->user_id === (int) $userId ;
});


Broadcast::channel('chat.admin', function ($user) {
    return  in_array(  $user->role,['admin' , 'sale']);
});



Broadcast::channel('admin.notifications', function ($user) {
    // Chỉ cho phép admin join
    // return $user && $user->is_admin === 1; 
    return in_array($user->role, ['admin']);
});



// Broadcast::channel('chatbot.{userId}', function ($user, $userId) {
//     return (int)$user->id === (int)$userId; // chỉ cho user đúng subscribe
// });

// Broadcast::channel('chatbot.guest.{sessionId}', function ($user, $sessionId) {
//     return true; // Cho phép tất cả guest truy cập kênh guest
// });