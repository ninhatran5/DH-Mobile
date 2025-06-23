<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('chat.user.{userId}', function ($user, $userId) {
    return (int) $user->user_id === (int) $userId;
});