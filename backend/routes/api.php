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


// API Category
// http://127.0.0.1:8000/api/categories
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
// http://127.0.0.1:8000/api/products
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

// Api AttributeValue
// http://127.0.0.1:8000/api/attributevalues
Route::middleware('auth:sanctum')->prefix('attributevalues')->controller(attributevalueController::class)->group(function () {
    Route::post('/', 'store');                    // Thêm thuộc tính con
    Route::put('/{id}', 'update');               // Cập nhật thuộc tính con theo ID
    Route::get('/trashed',  'trashed');         // Lấy danh sách thuộc tính con đã xóa mềm
    Route::delete('/{id}', 'destroy');           // Xóa mềm thuộc tính con
    Route::put('/restore/{id}', 'restore');      // Khôi phục thuộc tính con đã xóa mềm
    Route::delete('/forceDelete/{id}', 'forceDelete'); // Xóa vĩnh viễn
});
Route::get('attributevalue', [attributevalueController::class, 'index']); // lấy danh sách thuộc tính con
Route::get('attributevalue/{id}', [attributevalueController::class, 'show']); // lấy thuộc tính con theo id

// Api ProductVariants
// http://127.0.0.1:8000/api/productvariants
Route::middleware('auth:sanctum')->prefix('productvariants')->controller(ProductVariantsController::class)->group(function () {
    Route::post('/', 'store');                    // Thêm biến thể sản phẩm
    Route::put('/{id}', 'update');               // Cập nhật biến thể sản phẩm theo ID
    Route::get('/trashed',  'trashed');         // Lấy danh sách biến thể đã xóa mềm
    Route::delete('/{id}', 'destroy');           // Xóa mềm biến thể sản phẩm
    Route::put('/restore/{id}', 'restore');      // Khôi phục biến thể đã xóa mềm
    Route::delete('/forceDelete/{id}', 'forceDelete'); // Xóa vĩnh viễn
});
Route::get('productvariants', [ProductVariantsController::class, 'index']); // lấy danh sách biến thể sản phẩm
Route::get('productvariants/{id}', [ProductVariantsController::class, 'show']); // lấy biến thể sản phẩm theo id

// Api ProductSpecifications
// http://127.0.0.1:8000/api/productspecifications
Route::middleware('auth:sanctum')->prefix('productspecifications')->controller(ProductSpecificationsController::class)->group(function () {
    Route::post('/', 'store');                    // Thêm thông số kỹ thuật sản phẩm
    Route::put('/{id}', 'update');               // Cập nhật thông số kỹ thuật sản phẩm theo ID
    Route::get('/trashed',  'trashed');         // Lấy danh sách thông số kỹ thuật đã xóa mềm
    Route::delete('/{id}', 'destroy');           // Xóa mềm thông số kỹ thuật sản phẩm
    Route::put('/restore/{id}', 'restore');      // Khôi phục thông số kỹ thuật đã xóa mềm
    Route::delete('/forceDelete/{id}', 'forceDelete'); // Xóa vĩnh viễn
});
Route::get('productspecifications', [ProductSpecificationsController::class, 'index']); // lấy danh sách thông số kỹ thuật sản phẩm
Route::get('productspecifications/{id}', [ProductSpecificationsController::class, 'show']); // lấy thông số kỹ thuật sản phẩm theo id

// Api VariantAttributeValues
// http://127.0.0.1:8000/api/variantattributevalues
Route::middleware('auth:sanctum')->prefix('variantattributevalues')->controller(VariantAttributeValuesController::class)->group(function () {
    Route::post('/', 'store');                    // Thêm liên kết
    Route::put('/{id}', 'update');               // Cập nhật liên kết theo ID
    Route::get('/trashed',  'trashed');         // Lấy danh sách liên kết đã xóa mềm
    Route::delete('/{id}', 'destroy');           // Xóa mềm liên kết
    Route::put('/restore/{id}', 'restore');      // Khôi phục liên kết đã xóa mềm
    Route::delete('/forceDelete/{id}', 'forceDelete'); // Xóa vĩnh viễn
});
Route::get('variantattributevalues', [VariantAttributeValuesController::class, 'index']); // lấy danh sách liên kết
Route::get('variantattributevalues/{id}', [VariantAttributeValuesController::class, 'show']); // lấy liên kết theo id
