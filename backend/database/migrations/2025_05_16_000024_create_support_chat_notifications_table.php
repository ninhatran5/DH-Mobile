<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('support_chat_notifications', function (Blueprint $table) {
            $table->id('notification_id');
            $table->unsignedBigInteger('chat_id')->nullable();
            $table->unsignedBigInteger('user_id')->nullable(); // đổi từ recipient_id sang user_id
            $table->text('message')->nullable();
            $table->boolean('is_read')->default(0);
            $table->dateTime('created_at')->useCurrent();

            $table->foreign('chat_id')->references('chat_id')->on('support_chats');
            $table->foreign('user_id')->references('user_id')->on('users');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('support_chat_notifications');
    }
};
