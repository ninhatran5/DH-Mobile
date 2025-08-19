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
        Schema::create('loyalty_points', function (Blueprint $table) {
            $table->id('loyalty_point_id');
            $table->unsignedBigInteger('user_id');
            $table->integer('points'); // có thể là âm
            $table->string('type')->default('manual'); // manual | order | refund ...
            $table->string('description')->nullable(); // ví dụ: cộng điểm từ đơn hàng DH001
            $table->dateTime('expired_at')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('user_id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('loyalty_points');
    }
};
