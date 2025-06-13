<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id('order_id');
            $table->unsignedBigInteger('user_id')->nullable();
            $table->unsignedBigInteger('method_id')->nullable();
            $table->decimal('total_amount', 10, 2)->nullable();
            $table->enum('status', ['đang chờ', 'đã thanh toán', 'đã vận chuyển', 'đã hoàn thành', 'đã hủy', 'đã trả lại'])->default('đang chờ');
            $table->enum('payment_status', ['chưa thanh toán', 'đã thanh toán', 'đã hoàn trả', 'không thành công'])->default('chưa thanh toán');
            $table->unsignedBigInteger('voucher_id')->nullable();
            $table->dateTime('created_at')->useCurrent();
            $table->dateTime('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->foreign('user_id')->references('user_id')->on('users');
            $table->foreign('method_id')->references('method_id')->on('payment_methods');
            $table->foreign('voucher_id')->references('voucher_id')->on('vouchers');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
