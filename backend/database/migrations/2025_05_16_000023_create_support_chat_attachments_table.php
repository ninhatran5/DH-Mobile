<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('support_chat_attachments', function (Blueprint $table) {
            $table->id('attachment_id');
            $table->unsignedBigInteger('chat_id')->nullable();
            $table->string('file_url', 255)->nullable();
            $table->string('file_type', 50)->nullable();
            $table->dateTime('uploaded_at')->useCurrent();

            $table->foreign('chat_id')->references('chat_id')->on('support_chats');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('support_chat_attachments');
    }
};
