<?php

namespace App\Providers;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Broadcast;

class BroadcastServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Đăng ký các dịch vụ liên quan đến broadcasting nếu cần
    }

    /**
     * Bootstrap any application services.
     */

    public function boot()
    {
        // Đăng ký route xác thực broadcasting
        Broadcast::routes(['middleware' => ['api','auth:sanctum']]);

        // Load file định nghĩa kênh
        require base_path('routes/channels.php');
    }
}
