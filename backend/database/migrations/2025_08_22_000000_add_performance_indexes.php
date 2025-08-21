<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Thêm các indexes để tối ưu performance cho OrderController
     */
    public function up()
    {
        Schema::table('return_requests', function (Blueprint $table) {
            // Composite index cho query return_requests theo order_id và status
            $table->index(['order_id', 'status'], 'idx_return_requests_order_status');
            
            // Index cho user_id để join với users table
            $table->index('user_id', 'idx_return_requests_user_id');
            
            // Index cho created_at để sắp xếp
            $table->index('created_at', 'idx_return_requests_created_at');
            
            // Index cho return_order_id
            $table->index('return_order_id', 'idx_return_requests_return_order_id');
        });

        Schema::table('orders', function (Blueprint $table) {
            // Composite index cho query orders theo user_id và created_at
            $table->index(['user_id', 'created_at'], 'idx_orders_user_created');
            
            // Composite index cho query orders theo status và created_at 
            $table->index(['status', 'created_at'], 'idx_orders_status_created');
            
            // Index cho return_request_id
            $table->index('return_request_id', 'idx_orders_return_request_id');
            
            // Index cho is_return_order flag
            $table->index('is_return_order', 'idx_orders_is_return_order');
            
            // Composite index cho search theo order_code
            $table->index(['order_code'], 'idx_orders_order_code');
        });

        Schema::table('order_items', function (Blueprint $table) {
            // Composite index cho query order_items theo order_id
            $table->index(['order_id', 'product_id'], 'idx_order_items_order_product');
            
            // Index cho variant_id để join với product_variants
            $table->index('variant_id', 'idx_order_items_variant_id');
        });

        Schema::table('product_variants', function (Blueprint $table) {
            // Index cho variant_id (primary key đã có sẵn, nhưng đảm bảo)
            // Index cho price để tối ưu lookup
            $table->index('price', 'idx_product_variants_price');
        });

        Schema::table('order_status_histories', function (Blueprint $table) {
            // Composite index cho query history theo order_id và created_at
            $table->index(['order_id', 'created_at'], 'idx_order_history_order_created');
            
            // Index cho changed_by để join với users
            $table->index('changed_by', 'idx_order_history_changed_by');
        });

        // Index cho bảng variant_attribute_values nếu chưa có
        Schema::table('variant_attribute_values', function (Blueprint $table) {
            // Index cho variant_id để join nhanh hơn
            $table->index('variant_id', 'idx_variant_attr_values_variant_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::table('return_requests', function (Blueprint $table) {
            $table->dropIndex('idx_return_requests_order_status');
            $table->dropIndex('idx_return_requests_user_id');
            $table->dropIndex('idx_return_requests_created_at');
            $table->dropIndex('idx_return_requests_return_order_id');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex('idx_orders_user_created');
            $table->dropIndex('idx_orders_status_created');
            $table->dropIndex('idx_orders_return_request_id');
            $table->dropIndex('idx_orders_is_return_order');
            $table->dropIndex('idx_orders_order_code');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropIndex('idx_order_items_order_product');
            $table->dropIndex('idx_order_items_variant_id');
        });

        Schema::table('product_variants', function (Blueprint $table) {
            $table->dropIndex('idx_product_variants_price');
        });

        Schema::table('order_status_histories', function (Blueprint $table) {
            $table->dropIndex('idx_order_history_order_created');
            $table->dropIndex('idx_order_history_changed_by');
        });

        Schema::table('variant_attribute_values', function (Blueprint $table) {
            $table->dropIndex('idx_variant_attr_values_variant_id');
        });
    }
};
