<?php

use App\Http\Controllers\Api\AttributeController;
use App\Http\Controllers\Api\attributevalueController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BannerController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ProductSpecificationsController;
use App\Http\Controllers\Api\ProductVariantsController;
use App\Http\Controllers\Api\VariantAttributeValuesController;
use App\Http\Middleware\CheckAdmin;

// API Auth
// http://127.0.0.1:8000/api
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/resetpassword', [AuthController::class, 'resetPassword']);
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::put('/update-profile', [AuthController::class, 'updateProfile']);
});




// API Banner
// http://127.0.0.1:8000/api/banners
Route::get('/getbanners', [BannerController::class, 'index']); // lấy toàn bộ danh sách banner
Route::get('/getbanners/{id}', [BannerController::class, 'show']); // lấy banner theo id
Route::middleware('auth:sanctum')->group(function () {
    Route::middleware(CheckAdmin::class)->group(function () {
        Route::post('updatebanners/{id}', [BannerController::class, 'update']); // cập nhật banner theo id
    });
});

// Group các route cần quyền admin
Route::middleware(['auth:sanctum', CheckAdmin::class])->group(function () {
    // Category
    Route::prefix('categories')->controller(CategoryController::class)->group(function () {
        Route::post('/', 'store');
        Route::put('/{id}', 'update');
        Route::delete('/{id}', 'destroy');
        Route::put('/restore/{id}', 'restore');
        Route::delete('/forceDelete/{id}', 'forceDelete');
    });
    // Product
    Route::prefix('products')->controller(ProductController::class)->group(function () {
        Route::post('/', 'store');
        Route::put('/{id}', 'update');
        Route::delete('/{id}', 'destroy');
        Route::put('/restore/{id}', 'restore');
        Route::delete('/forceDelete/{id}', 'forceDelete');
    });
    // Attribute
    Route::prefix('attributes')->controller(AttributeController::class)->group(function () {
        Route::post('/', 'store');
        Route::put('/{id}', 'update');
        Route::delete('/{id}', 'destroy');
        Route::put('/restore/{id}', 'restore');
        Route::delete('/forceDelete/{id}', 'forceDelete');
    });
    // AttributeValue
    Route::prefix('attributevalues')->controller(attributevalueController::class)->group(function () {
        Route::post('/', 'store');
        Route::put('/{id}', 'update');
        Route::delete('/{id}', 'destroy');
        Route::put('/restore/{id}', 'restore');
        Route::delete('/forceDelete/{id}', 'forceDelete');
    });
    // ProductVariants
    Route::prefix('productvariants')->controller(ProductVariantsController::class)->group(function () {
        Route::post('/', 'store');
        Route::put('/{id}', 'update');
        Route::delete('/{id}', 'destroy');
        Route::put('/restore/{id}', 'restore');
        Route::delete('/forceDelete/{id}', 'forceDelete');
    });
    // ProductSpecifications
    Route::prefix('productspecifications')->controller(ProductSpecificationsController::class)->group(function () {
        Route::post('/', 'store');
        Route::put('/{id}', 'update');
        Route::delete('/{id}', 'destroy');
        Route::put('/restore/{id}', 'restore');
        Route::delete('/forceDelete/{id}', 'forceDelete');
    });
    // VariantAttributeValues
    Route::prefix('variantattributevalues')->controller(VariantAttributeValuesController::class)->group(function () {
        Route::post('/', 'store');
        Route::put('/{id}', 'update');
        Route::delete('/{id}', 'destroy');
        Route::put('/restore/{id}', 'restore');
        Route::delete('/forceDelete/{id}', 'forceDelete');
    });

});

// Các route chỉ đọc (không cần quyền admin)
Route::get('categories', [CategoryController::class, 'index']); // lấy danh sách danh mục
Route::get('categories/{id}', [CategoryController::class, 'show']); // lấy danh mục theo id
Route::get('products', [ProductController::class, 'index']); // lấy danh sách sản phẩm
Route::get('products/{id}', [ProductController::class, 'show']); // lấy sản phẩm theo id
Route::get('attributes', [AttributeController::class, 'index']); // lấy danh sách thuộc tính
Route::get('attributes/{id}', [AttributeController::class, 'show']); // lấy thuộc tính theo id
Route::get('attributevalue', [attributevalueController::class, 'index']); // lấy danh sách thuộc tính con
Route::get('attributevalue/{id}', [attributevalueController::class, 'show']); // lấy thuộc tính con theo id
Route::get('productvariants', [ProductVariantsController::class, 'index']); // lấy danh sách biến thể sản phẩm
Route::get('productvariants/{id}', [ProductVariantsController::class, 'show']); // lấy biến thể sản phẩm theo id
Route::get('productspecifications', [ProductSpecificationsController::class, 'index']); // lấy danh sách thông số kỹ thuật sản phẩm
Route::get('productspecifications/{id}', [ProductSpecificationsController::class, 'show']); // lấy thông số kỹ thuật sản phẩm theo id
Route::get('variantattributevalues', [VariantAttributeValuesController::class, 'index']); // lấy danh sách liên kết
Route::get('variantattributevalues/{id}', [VariantAttributeValuesController::class, 'show']); // lấy liên kết theo id
