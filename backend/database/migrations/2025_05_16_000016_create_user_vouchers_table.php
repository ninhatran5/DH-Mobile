<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_vouchers', function (Blueprint $table) {
            $table->id('user_voucher_id');
            $table->unsignedBigInteger('user_id')->nullable();
            $table->unsignedBigInteger('voucher_id')->nullable();
            $table->boolean('is_used')->default(0);
            $table->dateTime('used_at')->nullable();
            $table->dateTime('created_at')->useCurrent();
            $table->dateTime('updated_at')->useCurrent()->useCurrentOnUpdate();
            $table->integer('quantity')->default(1);
            $table->foreign('user_id')->references('user_id')->on('users');
            $table->foreign('voucher_id')->references('voucher_id')->on('vouchers');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_vouchers');
    }
};
