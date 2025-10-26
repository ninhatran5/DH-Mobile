<?php


use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;


return new class extends Migration {
    public function up(): void
    {
        Schema::create('support_chat_notifications', function (Blueprint $table) {
            $table->id('notification_id');
            $table->unsignedBigInteger('chat_id');        // liên kết đến tin nhắn
            $table->unsignedBigInteger('user_id');        // người nhận thông báo (admin, sale, hoặc customer)
            $table->boolean('is_read')->default(false);   // đã đọc hay chưa
            $table->dateTime('created_at')->useCurrent(); // thời gian tạo


            // Ràng buộc khóa ngoại
            $table->foreign('chat_id')
                ->references('chat_id')
                ->on('support_chats')
                ->onDelete('cascade');


            $table->foreign('user_id')
                ->references('user_id')
                ->on('users')
                ->onDelete('cascade');
        });
    }


    public function down(): void
    {
        Schema::dropIfExists('support_chat_notifications');
    }
};
