<?php


use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;


return new class extends Migration {
    public function up(): void
    {
        Schema::create('support_chats', function (Blueprint $table) {
            $table->id('chat_id');
            $table->unsignedBigInteger('customer_id')->nullable(); // người nhắn (user role = customer)
            $table->unsignedBigInteger('staff_id')->nullable();    // người trả lời (role = admin hoặc sale)
            $table->enum('sender', ['customer', 'admin', 'sale']); // người gửi là ai
            $table->text('message')->nullable();
            $table->dateTime('sent_at')->useCurrent();
            $table->boolean('is_read')->default(false);


            // Foreign keys
            $table->foreign('customer_id')->references('user_id')->on('users')->onDelete('set null');
            $table->foreign('staff_id')->references('user_id')->on('users')->onDelete('set null');
        });
    }


    public function down(): void
    {
        Schema::dropIfExists('support_chats');
    }
};
