<?php

use App\Http\Controllers\Api\AttributeController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BannerController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Middleware\CheckAdmin;

// API Auth     
Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/register', [AuthController::class, 'register']);
});



// API Banner
Route::get('/getbanners', [BannerController::class, 'index']); // lấy toàn bộ danh sách banner
Route::get('/getbanners/{id}', [BannerController::class, 'show']); // lấy banner theo id
Route::middleware('auth:sanctum')->group(function () {
    Route::post('updatebanners/{id}', [BannerController::class, 'update']); // cập nhật banner theo id
});


// API Category
Route::middleware('auth:sanctum')->prefix('categories')->controller(CategoryController::class)->group(function () {
    Route::post('/', 'store');                    // Thêm danh mục
    Route::put('/{id}', 'update');               // Cập nhật danh mục theo ID
    Route::get('/trashed',  'trashed');         // Lấy danh sách danh mục đã xóa mềm
    Route::delete('/{id}', 'destroy');           // Xóa mềm danh mục    
    Route::put('/restore/{id}', 'restore');      // Khôi phục danh mục đã xóa mềm
    Route::delete('/forceDelete/{id}', 'forceDelete'); // Xóa vĩnh viễn
});
Route::get('categories', [CategoryController::class, 'index']); // lấy danh sách danh mục
Route::get('categories/{id}', [CategoryController::class, 'show']); // lấy danh mục theo id


// Api Product
Route::middleware('auth:sanctum')->prefix('products')->controller(ProductController::class)->group(function () {
    Route::post('/', 'store');                    // Thêm sản phẩm
    Route::put('/{id}', 'update');               // Cập nhật sản phẩm theo ID
    Route::get('/trashed',  'trashed');         // Lấy danh sách sản phẩm đã xóa mềm
    Route::delete('/{id}', 'destroy');           // Xóa mềm sản phẩm
    Route::put('/restore/{id}', 'restore');      // Khôi phục sản phẩm đã xóa mềm
    Route::delete('/forceDelete/{id}', 'forceDelete'); // Xóa vĩnh viễn
});
Route::get('products', [ProductController::class, 'index']); // lấy danh sách sản phẩm
Route::get('products/{id}', [ProductController::class, 'show']); // lấy sản phẩm theo id

// Api Attributes
// http://127.0.0.1:8000/api/attributes
Route::middleware('auth:sanctum')->prefix('attributes')->controller(AttributeController::class)->group(function () {
    Route::post('/', 'store');                    // Thêm thuộc tính
    Route::put('/{id}', 'update');               // Cập nhật thuộc tính theo ID
    Route::get('/trashed',  'trashed');         // Lấy danh sách thuộc tính đã xóa mềm
    Route::delete('/{id}', 'destroy');           // Xóa mềm thuộc tính
    Route::put('/restore/{id}', 'restore');      // Khôi phục thuộc tính đã xóa mềm
    Route::delete('/forceDelete/{id}', 'forceDelete'); // Xóa vĩnh viễn
});
Route::get('attributes', [AttributeController::class, 'index']); // lấy danh sách thuộc tính
Route::get('attributes/{id}', [AttributeController::class, 'show']); // lấy thuộc tính theo id




// Route::middleware(CheckAdmin::class)->group(function () {  
// });
