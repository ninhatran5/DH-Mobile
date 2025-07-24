<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('chat.user.{userId}', function ($user, $userId) {
    return (int) $user->user_id === (int) $userId ;
});


Broadcast::channel('chat.admin', function ($user) {
    return  in_array(  $user->role,['admin' , 'sale']);
});