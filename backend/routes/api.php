<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BannerController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Middleware\CheckAdmin;

// API login     

Route::post('/login', [AuthController::class, 'login']);

// API Banner
// http://127.0.0.1:8000/api/getbanners
Route::get('/getbanners', [BannerController::class, 'index']); // lấy toàn bộ danh sách banner
// http://127.0.0.1:8000/api/getbanners/{id}
Route::get('/getbanners/{id}', [BannerController::class, 'show']); // lấy banner theo id

Route::middleware('auth:sanctum')->group(function () {
    // http://127.0.0.1:8000/api/getbanners/{id}
    Route::post('updatebanners/{id}', [BannerController::class, 'update']); // cập nhật banner theo id
});

// API Category
// http://127.0.0.1:8000/api/categories | phương thức GET | Lấy Danh Sách Danh Mục
// http://127.0.0.1:8000/api/categories/id | phương thức GET | Lấy Danh Mục Theo ID | thay id bằng số id của danh mục
// http://127.0.0.1:8000/api/categories | phương thức POST | Thêm Danh Mục
// http://127.0.0.1:8000/api/categories/id | phương thức PUT  | Cập Nhật Danh Mục Theo ID | thay id bằng số id của danh mục
// http://127.0.0.1:8000/api/categories/id | phương thức DELETE  | Xóa (mềm) Danh Mục Theo ID | thay id bằng số id của danh mục
// http://127.0.0.1:8000/api/categories/trashed | phương thức GET | Lấy Danh Sách Danh Mục Đã Xóa (mềm)
// http://127.0.0.1:8000/api/categories/restore/id | phương thức PUT | Khôi Phục Danh Mục Đã Xóa (mềm) | thay id bằng số id của danh mục
// http://127.0.0.1:8000/api/categories/forceDelete/id | phương thức DELETE | Xóa Vĩnh Viễn Danh Mục | thay id bằng số id của danh mục
//Route::apiResource('categories', CategoryController::class); // tạo các route cho các phương thức index, store, show, update, destroy


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








// Route::middleware(CheckAdmin::class)->group(function () {  
// });
