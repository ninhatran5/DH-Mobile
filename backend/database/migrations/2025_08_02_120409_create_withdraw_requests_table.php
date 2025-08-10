<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('withdraw_requests', function (Blueprint $table) {
            $table->id('withdraw_id')->comment('ID yêu cầu rút tiền');
            $table->foreignId('user_id')
                ->constrained('users', 'user_id')
                ->cascadeOnDelete()
                ->comment('Người yêu cầu rút tiền');
            $table->foreignId('wallet_id')
                ->constrained('wallets', 'wallet_id')
                ->cascadeOnDelete()
                ->comment('Ví liên kết');
                $table->foreignId('transaction_id')
                ->constrained('wallet_transactions', 'transaction_id')
                ->cascadeOnDelete()->nullable();
            $table->decimal('amount', 11, 2)->comment('Số tiền yêu cầu rút');
            $table->string('bank_name', 100)->comment('Tên ngân hàng');
            $table->string('bank_account_number', 50)->comment('Số tài khoản');
            $table->string('bank_account_name', 100)->comment('Chủ tài khoản');
            $table->string('beneficiary_bank', 100)->nullable()->comment('Ngân hàng thụ hưởng');
            $table->enum('status', ['Thêm thông tin', 'Chờ xử lý', 'Đã hoàn tất'])
                ->default('Thêm thông tin')
                ->comment('Trạng thái xử lý');
            $table->string('img_qr', 255)->nullable()->comment('URL hình ảnh liên quan đến yêu cầu rút tiền');
            $table->string('img_bill', 255)->nullable()->comment('URL hình ảnh hóa đơn');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('withdraw_requests');
    }
};
