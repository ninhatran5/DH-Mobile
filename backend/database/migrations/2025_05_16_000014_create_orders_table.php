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
            $table->decimal('paid_by_wallet', 11, 2)->default(0);
            $table->decimal('paid_by_vnpay', 11, 2)->default(0);
            $table->decimal('total_amount', 11, 2)->nullable();
            $table->string('cancel_reason')->nullable(); // cái này là lý do khách hàng báo hủy khi đang xác nhận
            $table->string('address')->nullable();
            $table->string('ward')->nullable();
            $table->string('district')->nullable();
            $table->string('city')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('customer')->nullable();

            $table->enum('status', [
                'Chờ xác nhận',
                'Đã xác nhận',
                'Đang vận chuyển',
                'Đã giao hàng',
                'Hoàn thành',
                'Đã hủy',
                'Yêu cầu hoàn hàng',
                'Đã chấp thuận',
                'Đã từ chối',
                'Đang xử lý',
                'Đã trả hàng',
            ])->default('Chờ xác nhận');

            $table->enum('payment_status', [
                'Chưa thanh toán',
                'Đã thanh toán',
                'Đã hoàn tiền',
                'Thanh toán thất bại'
            ])->default('Chưa thanh toán');
            $table->decimal('rank_discount', 11, 2)->default(0);
            $table->unsignedBigInteger('voucher_id')->nullable();
            $table->decimal('voucher_discount', 11, 2)->nullable();
            $table->timestamp('delivered_at')->nullable();
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
