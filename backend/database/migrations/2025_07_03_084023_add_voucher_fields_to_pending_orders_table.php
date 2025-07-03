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
        Schema::table('pending_orders', function (Blueprint $table) {
            // Thêm cột voucher_id sau cột total_amount
            $table->unsignedBigInteger('voucher_id')->nullable()->after('total_amount');
            // Thêm cột voucher_discount sau cột voucher_id
            $table->decimal('voucher_discount', 15, 2)->default(0)->after('voucher_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pending_orders', function (Blueprint $table) {
            $table->dropColumn('voucher_id');
            $table->dropColumn('voucher_discount');
        });
    }
};
