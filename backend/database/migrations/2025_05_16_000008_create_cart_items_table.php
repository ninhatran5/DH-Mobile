<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cart_items', function (Blueprint $table) {
            $table->id('item_id');
            $table->unsignedBigInteger('cart_id')->nullable();
            $table->unsignedBigInteger('variant_id')->nullable();
            $table->integer('quantity')->default(1);
            $table->dateTime('created_at')->useCurrent();
            $table->dateTime('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->foreign('cart_id')->references('cart_id')->on('carts');
            $table->foreign('variant_id')->references('variant_id')->on('product_variants');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cart_items');
    }
};
