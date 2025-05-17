<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_likes', function (Blueprint $table) {
            $table->id('like_id');
            $table->unsignedBigInteger('user_id')->nullable();
            $table->unsignedBigInteger('product_id')->nullable();
            $table->dateTime('created_at')->useCurrent();

            $table->unique(['user_id', 'product_id'], 'product_likes_index_0');
            $table->foreign('user_id')->references('user_id')->on('users');
            $table->foreign('product_id')->references('product_id')->on('products');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_likes');
    }
};
