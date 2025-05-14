<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BannerController;
use App\Http\Middleware\CheckAdmin;

    // API Auth     
    // http://127.0.0.1:8000/api/login
Route::post('/login', [AuthController::class, 'login']);


Route::middleware('auth:sanctum')->group(function () {
    // http://127.0.0.1:8000/api/logout
    Route::post('/logout', [AuthController::class, 'logout']);
});



    // API Banner
    // http://127.0.0.1:8000/api/getbanners
Route::get('/getbanners', [BannerController::class, 'index']); // lấy toàn bộ danh sách banner
    // http://127.0.0.1:8000/api/getbanners/{id}
Route::get('/getbanners/{id}', [BannerController::class, 'show']); // lấy banner theo id

Route::middleware('auth:sanctum')->group(function () {
    // http://127.0.0.1:8000/api/getbanners/{id}
    Route::post('updatebanners/{id}', [BannerController::class, 'update']); // cập nhật banner theo id
});











// Route::middleware(CheckAdmin::class)->group(function () {  
// });
