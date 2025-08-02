<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('wallet_transactions', function (Blueprint $table) {
            $table->id('transaction_id');
            $table->unsignedBigInteger('wallet_id');
            $table->enum('type', ['hoàn tiền', 'tiêu tiền', 'rút tiền']);
            $table->decimal('amount', 11, 2);
            $table->text('note')->nullable();
            $table->unsignedBigInteger('return_id')->nullable(); // Liên kết nếu từ hoàn hàng
            $table->timestamps();

            $table->foreign('wallet_id')->references('wallet_id')->on('wallets')->onDelete('cascade');
            $table->foreign('return_id')->references('return_id')->on('return_requests')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wallet_transactions');
    }
};
