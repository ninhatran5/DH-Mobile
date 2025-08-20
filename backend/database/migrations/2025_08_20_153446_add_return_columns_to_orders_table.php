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
        Schema::table('orders', function (Blueprint $table) {
            $table->unsignedBigInteger('return_request_id')->nullable()->after('voucher_discount');
            $table->boolean('is_return_order')->default(false)->after('return_request_id');
            $table->unsignedBigInteger('original_order_id')->nullable()->after('is_return_order');
            
            // Add foreign key constraints
            $table->foreign('return_request_id')->references('return_id')->on('return_requests')->onDelete('set null');
            $table->foreign('original_order_id')->references('order_id')->on('orders')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['return_request_id']);
            $table->dropForeign(['original_order_id']);
            $table->dropColumn(['return_request_id', 'is_return_order', 'original_order_id']);
        });
    }
};
