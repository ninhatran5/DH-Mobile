<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('news', function (Blueprint $table) {
            $table->id('news_id');
            $table->string('title', 255);
            $table->text('content');
            $table->string('image_url', 255)->nullable();
            $table->dateTime('created_at')->useCurrent();
            $table->dateTime('deleted_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('news');
    }
};
