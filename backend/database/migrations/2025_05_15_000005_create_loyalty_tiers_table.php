<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('loyalty_tiers', function (Blueprint $table) {
            $table->id('tier_id');
            $table->string('name', 50)->unique(); // Tên cấp (Bạc, Vàng, Kim cương)
            $table->string('image_url')->nullable(); // URL hình ảnh đại diện cho cấp độ
            $table->integer('min_points'); // Từ bao nhiêu điểm thì đạt cấp này
            $table->decimal('discount_percent', 5, 2)->default(0.00); // Giảm giá ưu đãi (nếu có)
            $table->text('description')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('loyalty_tiers');
    }
};
