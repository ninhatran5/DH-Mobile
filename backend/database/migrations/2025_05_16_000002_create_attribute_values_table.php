<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attribute_values', function (Blueprint $table) {
            $table->id('value_id');
            $table->unsignedBigInteger('attribute_id')->nullable();
            $table->string('value', 100);
            $table->dateTime('deleted_at')->nullable();
            $table->timestamp('updated_at')->nullable()->useCurrent()->useCurrentOnUpdate();
            $table->timestamp('created_at')->nullable()->useCurrent();

            $table->foreign('attribute_id')->references('attribute_id')->on('attributes');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attribute_values');
    }
};
