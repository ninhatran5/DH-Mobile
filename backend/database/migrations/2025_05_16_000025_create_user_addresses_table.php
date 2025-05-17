<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_addresses', function (Blueprint $table) {
            $table->id('address_id');
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('recipient_name', 100)->nullable();
            $table->string('phone', 15)->nullable();
            $table->text('address')->nullable();
            $table->boolean('is_default')->default(0);
            $table->dateTime('created_at')->useCurrent();

            $table->foreign('user_id')->references('user_id')->on('users');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_addresses');
    }
};
