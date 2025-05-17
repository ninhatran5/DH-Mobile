<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('return_logs', function (Blueprint $table) {
            $table->id('log_id');
            $table->unsignedBigInteger('return_id')->nullable();
            $table->string('action', 255)->nullable();
            $table->text('note')->nullable();
            $table->dateTime('created_at')->useCurrent();

            $table->foreign('return_id')->references('return_id')->on('return_requests');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('return_logs');
    }
};
