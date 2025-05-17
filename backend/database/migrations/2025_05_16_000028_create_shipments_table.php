<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shipments', function (Blueprint $table) {
            $table->id('shipment_id');
            $table->unsignedBigInteger('order_id')->nullable();
            $table->string('tracking_number', 50)->nullable();
            $table->string('carrier', 50)->nullable();
            $table->enum('status', ['pending', 'processing', 'shipped', 'delivered', 'cancelled'])->default('pending');
            $table->text('shipping_address')->nullable();
            $table->dateTime('shipped_at')->nullable();
            $table->dateTime('delivered_at')->nullable();
            $table->dateTime('created_at')->useCurrent();
            $table->dateTime('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->foreign('order_id')->references('order_id')->on('orders');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shipments');
    }
};
