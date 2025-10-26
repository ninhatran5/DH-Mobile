<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('return_notifications', function (Blueprint $table) {
            $table->bigIncrements('return_notification_id'); // primary key
            $table->unsignedBigInteger('order_id');
            $table->unsignedBigInteger('return_request_id');
            $table->string('message');
            $table->boolean('is_read')->default(false);
            $table->timestamps();

            // Index
            $table->index('order_id', 'idx_return_notifications_order');
            $table->index('return_request_id', 'idx_return_notifications_request');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('return_notifications');
    }
};
