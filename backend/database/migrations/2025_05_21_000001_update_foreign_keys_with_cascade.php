<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Drop existing foreign keys
        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
        });

        Schema::table('product_variants', function (Blueprint $table) {
            $table->dropForeign(['product_id']);
        });

        Schema::table('product_specifications', function (Blueprint $table) {
            $table->dropForeign(['product_id']);
        });

        Schema::table('variant_attribute_values', function (Blueprint $table) {
            $table->dropForeign(['variant_id']);
        });

        // Re-add foreign keys with cascade delete
        Schema::table('products', function (Blueprint $table) {
            $table->foreign('category_id')
                  ->references('category_id')
                  ->on('categories')
                  ->onDelete('cascade');
        });

        Schema::table('product_variants', function (Blueprint $table) {
            $table->foreign('product_id')
                  ->references('product_id')
                  ->on('products')
                  ->onDelete('cascade');
        });

        Schema::table('product_specifications', function (Blueprint $table) {
            $table->foreign('product_id')
                  ->references('product_id')
                  ->on('products')
                  ->onDelete('cascade');
        });

        Schema::table('variant_attribute_values', function (Blueprint $table) {
            $table->foreign('variant_id')
                  ->references('variant_id')
                  ->on('product_variants')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        // Drop cascading foreign keys
        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
        });

        Schema::table('product_variants', function (Blueprint $table) {
            $table->dropForeign(['product_id']);
        });

        Schema::table('product_specifications', function (Blueprint $table) {
            $table->dropForeign(['product_id']);
        });

        Schema::table('variant_attribute_values', function (Blueprint $table) {
            $table->dropForeign(['variant_id']);
        });

        // Re-add original foreign keys without cascade
        Schema::table('products', function (Blueprint $table) {
            $table->foreign('category_id')
                  ->references('category_id')
                  ->on('categories');
        });

        Schema::table('product_variants', function (Blueprint $table) {
            $table->foreign('product_id')
                  ->references('product_id')
                  ->on('products');
        });

        Schema::table('product_specifications', function (Blueprint $table) {
            $table->foreign('product_id')
                  ->references('product_id')
                  ->on('products');
        });

        Schema::table('variant_attribute_values', function (Blueprint $table) {
            $table->foreign('variant_id')
                  ->references('variant_id')
                  ->on('product_variants');
        });
    }
};
