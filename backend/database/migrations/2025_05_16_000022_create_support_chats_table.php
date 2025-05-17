<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('support_chats', function (Blueprint $table) {
            $table->id('chat_id');
            $table->unsignedBigInteger('customer_id')->nullable();
            $table->unsignedBigInteger('staff_id')->nullable();
            $table->text('message')->nullable();
            $table->enum('sender', ['customer', 'staff']);
            $table->dateTime('sent_at')->useCurrent();
            $table->boolean('is_read')->default(0);

            $table->foreign('customer_id')->references('user_id')->on('users');
            $table->foreign('staff_id')->references('user_id')->on('users');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('support_chats');
    }
};
