<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_specifications', function (Blueprint $table) {
            $table->id('spec_id');
            $table->unsignedBigInteger('product_id')->nullable();
            $table->string('spec_name', 255);
            $table->string('spec_value', 255);
            $table->dateTime('created_at')->useCurrent();
            $table->dateTime('updated_at')->useCurrent()->useCurrentOnUpdate();
            $table->dateTime('deleted_at')->nullable();

            $table->foreign('product_id')->references('product_id')->on('products');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_specifications');
    }
};
