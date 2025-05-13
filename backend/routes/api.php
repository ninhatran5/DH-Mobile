<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BannerController;
use App\Http\Middleware\CheckAdmin;

// API login     check postman dùng raw

Route::post('/login', [AuthController::class, 'login']);

// API Banner
// http://127.0.0.1:80000/api/getbanners
Route::get('/getbanners', [BannerController::class, 'index']); // lấy toàn bộ danh sách banner
// http://127.0.0.1:80000/api/getbanners/1
Route::get('/getbanners/{id}', [BannerController::class, 'show']); // lấy banner theo id







// Route::middleware(CheckAdmin::class)->group(function () {  
// });



