<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('return_requests', function (Blueprint $table) {
            $table->id('return_id');
            $table->unsignedBigInteger('order_id')->nullable();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->text('reason')->nullable();
            $table->enum('status', ['đã yêu cầu','đã chấp thuận','đã từ chối','đang xử lý','đã hoàn lại','đã hủy'])->default('requested');
            $table->decimal('refund_amount', 10, 2)->nullable();
            $table->dateTime('created_at')->useCurrent();
            $table->dateTime('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->foreign('order_id')->references('order_id')->on('orders');
            $table->foreign('user_id')->references('user_id')->on('users');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('return_requests');
    }
};
