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
        Schema::create('pending_orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_code')->unique();
            $table->unsignedBigInteger('user_id');
            $table->json('items');
            $table->decimal('total_amount', 15, 2);
            $table->unsignedBigInteger('voucher_id')->nullable();
            $table->decimal('voucher_discount', 15, 2)->default(0);
            $table->string('customer')->nullable();
            $table->string('address')->nullable();
            $table->string('ward')->nullable();
            $table->string('district')->nullable();
            $table->string('city')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->decimal('paid_by_wallet', 15, 2)->default(0);
            $table->decimal('paid_by_vnpay', 15, 2)->default(0);
            $table->decimal('rank_discount', 11, 2)->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pending_orders');
    }
};
