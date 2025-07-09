<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('comments', function (Blueprint $table) {
            $table->id('comment_id');
            $table->unsignedBigInteger('user_id')->nullable();
            $table->unsignedBigInteger('product_id')->nullable();
            $table->unsignedBigInteger('variant_id')->nullable();
            $table->unsignedBigInteger('replied_by')->nullable();
            $table->text('content')->nullable();
            $table->integer('rating')->nullable();
            $table->json('upload_urls')->nullable();
            $table->text('reply')->nullable();
            $table->dateTime('replied_at')->nullable();
            $table->boolean('is_visible')->default(true);
            $table->dateTime('created_at')->useCurrent();

            $table->foreign('variant_id')->references('variant_id')->on('product_variants');
            $table->foreign('replied_by')->references('user_id')->on('users');
            $table->foreign('user_id')->references('user_id')->on('users');
            $table->foreign('product_id')->references('product_id')->on('products');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('comments');
    }
};
