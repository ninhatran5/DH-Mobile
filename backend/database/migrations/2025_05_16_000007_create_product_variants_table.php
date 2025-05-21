<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_variants', function (Blueprint $table) {
            $table->id('variant_id');
            $table->unsignedBigInteger('product_id')->nullable();
            $table->string('sku', 50)->unique();
            $table->decimal('price', 10, 2);
            $table->integer('stock')->default(0);
            $table->boolean('is_active')->default(1);
            $table->dateTime('created_at')->useCurrent();
            $table->dateTime('updated_at')->useCurrent()->useCurrentOnUpdate();
            $table->dateTime('deleted_at')->useCurrent();

            $table->foreign('product_id')->references('product_id')->on('products');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_variants');
    }
};
