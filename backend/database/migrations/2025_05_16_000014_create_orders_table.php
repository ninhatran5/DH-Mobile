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
            $table->string('order_code', 50)->unique();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->unsignedBigInteger('method_id')->nullable();
            $table->decimal('total_amount', 10, 2)->nullable();
            $table->enum('status', ['Đang chờ', 'Đã thanh toán', 'Đã vận chuyển', 'Đã hoàn thành', 'Đã hủy', 'Đã trả lại'])->default('Đang chờ');
            $table->enum('payment_status', ['Chưa thanh toán', 'Đã thanh toán', 'Đã hoàn trả', 'Không thành công'])->default('Chưa thanh toán');
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
