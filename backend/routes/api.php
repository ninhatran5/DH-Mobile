<?php

use App\Http\Controllers\Api\PaymentMethodController;
use App\Http\Middleware\CheckAdmin;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\NewsController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\BannerController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\VorcherController;
use App\Http\Controllers\Api\CartItemController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\AttributeController;
use App\Http\Controllers\Api\ProductLikeController;
use App\Http\Controllers\Api\AttributevalueController;
use App\Http\Controllers\Api\ProductVariantsController;
use App\Http\Controllers\Api\ProductSpecificationsController;
use App\Http\Controllers\Api\ProductsViewsController;
use App\Http\Controllers\Api\VariantAttributeValuesController;

// API Auth
// http://127.0.0.1:8000/api
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::put('/resetpassword', [AuthController::class, 'resetPassword']);
Route::middleware('auth:sanctum')->group(function () {
Route::post('/logout', [AuthController::class, 'logout']);
Route::get('/refreshToken', [AuthController::class, 'refreshToken']);
});


// API User

// Admin 
Route::middleware('auth:sanctum')->group(function () {
    Route::middleware(CheckAdmin::class)->group(function () {
        Route::get('/getuser', [UserController::class, 'getuser']);
        Route::get('/getuser/{id}', [UserController::class, 'getuserbyid']);
        Route::post('/createuser', [UserController::class, 'createuser']);
        Route::put('/updateuser/{id}', [UserController::class, 'updateuser']);
        Route::delete('/deleteuser/{id}', [UserController::class, 'deleteuser']);
        Route::get('/trashuser', [UserController::class, 'trashuser']);
        Route::put('/restoreuser/{id}', [UserController::class, 'restoreuser']);
        Route::delete('/forceDeleteUser/{id}', [UserController::class, 'forceDeleteUser']);
    });
});
// Client
Route::middleware('auth:sanctum')->group(function () {
    Route::put('/update-profile', [UserController::class, 'updateProfile']);
    Route::get('/profile', [UserController::class, 'profile']);
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
        Route::get('/trashed', 'trashed');
    });
    // Product
    Route::prefix('products')->controller(ProductController::class)->group(function () {
        Route::post('/', 'store');
        Route::put('/{id}', 'update');
        Route::delete('/{id}', 'destroy');
        Route::put('/restore/{id}', 'restore');
        Route::delete('/forceDelete/{id}', 'forceDelete');
        Route::get('/trashed', 'trashed');
    });
    // Attribute
    Route::prefix('attributes')->controller(AttributeController::class)->group(function () {
        Route::post('/', 'store');
        Route::put('/{id}', 'update');
        Route::delete('/{id}', 'destroy');
        Route::put('/restore/{id}', 'restore');
        Route::delete('/forceDelete/{id}', 'forceDelete');
        Route::get('/trashed', 'trashed');
    });
    // AttributeValue
    Route::prefix('attributevalues')->controller(AttributevalueController::class)->group(function () {
        Route::post('/', 'store');
        Route::put('/{id}', 'update');
        Route::delete('/{id}', 'destroy');
        Route::put('/restore/{id}', 'restore');
        Route::delete('/forceDelete/{id}', 'forceDelete');
        Route::get('/trashed', 'trashed');
    });
    // ProductVariants
    Route::prefix('productvariants')->controller(ProductVariantsController::class)->group(function () {
        Route::post('/', 'store');
        Route::put('/{id}', 'update');
        Route::delete('/{id}', 'destroy');
        Route::put('/restore/{id}', 'restore');
        Route::delete('/forceDelete/{id}', 'forceDelete');
        Route::get('/trashed', 'trashed');
    });
    // ProductSpecifications
    Route::prefix('productspecifications')->controller(ProductSpecificationsController::class)->group(function () {
        Route::post('/', 'store');
        Route::put('/{id}', 'update');
        Route::delete('/{id}', 'destroy');
        Route::put('/restore/{id}', 'restore');
        Route::delete('/forceDelete/{id}', 'forceDelete');
        Route::get('/trashed', 'trashed');
    });
    // VariantAttributeValues
    Route::prefix('variantattributevalues')->controller(VariantAttributeValuesController::class)->group(function () {
        Route::post('/', 'store');
        Route::post('/{id}', 'update');
        Route::delete('/{id}', 'destroy');
        Route::put('/restore/{id}', 'restore');
        Route::delete('/forceDelete/{id}', 'forceDelete');
        Route::get('/trashed', 'trashed');
    });
    // News
    Route::prefix('news')->controller(NewsController::class)->group(function () {
        Route::post('/', 'store');
        Route::put('/{id}', 'update');
        Route::delete('/{id}', 'destroy');
        Route::put('/restore/{id}', 'restore');
        Route::delete('/forceDelete/{id}', 'forceDelete');
        Route::get('/trashed', 'trashed');
    });
    // Vorcher
    Route::prefix('vorchers')->controller(VorcherController::class)->group(function () {
        Route::post('/', 'store');
        Route::put('/{id}', 'update');
        Route::delete('/{id}', 'destroy');
        Route::put('/restore/{id}', 'restore');
        Route::delete('/forceDelete/{id}', 'forceDelete');
        Route::get('/trashed', 'trashed');
    });
    // product views 
    Route::prefix('productsviews')->controller(ProductsViewsController::class)->group(function () {
        Route::post('/', 'addview'); // thêm sản phẩm đã xem
        Route::delete('/{view_id}', 'deleteView'); // xóa sản phẩm đã xem theo view_id
        Route::delete('/deleteall', 'deleteAllViews'); // xóa tất cả sản phẩm đã xem
        Route::get('/getbyuser/{user_id}', 'getViewsByUserId'); // lấy sản phẩm đã xem theo user_id
        // Route::get('/getall', 'getAllViews'); // lấy tất cả sản phẩm đã xem 
    });




});

// Các route chỉ đọc (không cần quyền admin)
Route::get('categories', [CategoryController::class, 'index']); // lấy danh sách danh mục
Route::get('categories/{id}', [CategoryController::class, 'show']); // lấy danh mục theo id
Route::get('products', [ProductController::class, 'index']); // lấy danh sách sản phẩm
Route::get('products/{id}', [ProductController::class, 'show']); // lấy sản phẩm theo id
Route::get('attributes', [AttributeController::class, 'index']); // lấy danh sách thuộc tính
Route::get('attributes/{id}', [AttributeController::class, 'show']); // lấy thuộc tính theo id
Route::get('attributevalues', [AttributevalueController::class, 'index']); // lấy danh sách thuộc tính con
Route::get('attributevalues/{id}', [AttributevalueController::class, 'show']); // lấy thuộc tính con theo id
Route::get('productvariants', [ProductVariantsController::class, 'index']); // lấy danh sách biến thể sản phẩm
Route::get('productvariants/{id}', [ProductVariantsController::class, 'show']); // lấy biến thể sản phẩm theo id
Route::get('productspecifications', [ProductSpecificationsController::class, 'index']); // lấy danh sách thông số kỹ thuật sản phẩm
Route::get('productspecifications/{id}', [ProductSpecificationsController::class, 'show']); // lấy thông số kỹ thuật sản phẩm theo id
Route::get('variantattributevalues', [VariantAttributeValuesController::class, 'index']); // lấy danh sách liên kết
Route::get('variantattributevalues/{id}', [VariantAttributeValuesController::class, 'show']); // lấy liên kết theo id
Route::get('news', [NewsController::class, 'index']); // lấy danh sách tin tức
Route::get('news/{id}', [NewsController::class, 'show']); // lấy tin tức theo id
Route::get('vorchers', [VorcherController::class, 'index']); // lấy danh sách vorcher
Route::get('vorchers/{id}', [VorcherController::class, 'show']); // lấy vorcher theo id




// product like
Route::middleware('auth:sanctum')->group(function () {
    Route::post('productlike/{id}', [ProductLikeController::class,'productlike']);
    Route::delete('productunlike/{id}', [ProductLikeController::class,'productunlike']);
    Route::get('listproductlike', [ProductLikeController::class,'listproductlike']);
    Route::put('updatestatuslike/{id}', [ProductLikeController::class,'updatestatuslike']);
});

// cart and cart item
Route::middleware('auth:sanctum')->group(function () {
Route::post('cart', [CartController::class, 'Cart']);

// // thêm sản phẩm vào giỏ hàng
Route::post('cart/add/{id}', [CartItemController::class, 'addProductToCart']);
// // cập nhật số lượng sản phẩm trong giỏ hàng
Route::post('cart/updateProductQuantity/{id}', [CartItemController::class, 'updateProductQuantity']);
// // lấy giỏ hàng của người dùng
Route::get('getCart', [CartItemController::class, 'getCart']);
// // xóa sản phẩm khỏi giỏ hàng
Route::delete('cart/remove/{id}', [CartItemController::class, 'removeProductFromCart']);
// // xóa toàn bộ giỏ hàng
Route::delete('cart/clear', [CartItemController::class, 'clearCart']);


// payment

Route::middleware('auth:sanctum')->group(function () {

Route::get('getPaymentMethods', [PaymentMethodController::class, 'getPaymentMethods']);

    Route::middleware(CheckAdmin::class)->group(function () {
       Route::post('addPayment' , [PaymentMethodController::class, 'addPayment']);
    });
});

});


