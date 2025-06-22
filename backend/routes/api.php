<?php

use GuzzleHttp\Client;
use App\Http\Middleware\CheckAdmin;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CodController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\NewsController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\VnpayController;
use App\Http\Controllers\Api\BannerController;
use App\Http\Controllers\Api\ChatbotController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\VoucherController;
use App\Http\Controllers\Api\CartItemController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\AttributeController;
use App\Http\Controllers\Api\ProductLikeController;
use App\Http\Controllers\Api\UserAddressController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PaymentMethodController;
use App\Http\Controllers\Api\ProductsViewsController;
use App\Http\Controllers\Api\AttributevalueController;
use App\Http\Controllers\Api\ProductVariantsController;
use App\Http\Controllers\Api\ProductSpecificationsController;
use App\Http\Controllers\Api\VariantAttributeValuesController;
use App\Http\Controllers\Api\SupportChatController;







// API thanh toán
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/vnpay/checkout', [VnpayController::class, 'createPayment']);
    Route::post('/codpay/checkout', [CodController::class, 'createCodOrder']);
});

Route::get('/vnpay/return', [VnpayController::class, 'handleReturn']);




// API Auth
// http://127.0.0.1:8000/api
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::put('/resetpassword', [AuthController::class, 'resetPassword']);
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/refresh', [AuthController::class, 'refreshToken']);
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

    // User addresses
    Route::get('/user-addresses', [UserAddressController::class, 'index']);
    Route::post('/user-addresses', [UserAddressController::class, 'store']);
    Route::put('/user-addresses/{id}', [UserAddressController::class, 'update']);
    Route::delete('/user-addresses/{id}', [UserAddressController::class, 'destroy']);
    Route::put('/user-addresses/set-default/{id}', [UserAddressController::class, 'setDefault']);
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
    // Vouucher
    Route::prefix('voucher')->controller(VoucherController::class)->group(function () {
        Route::post('/', 'store');
        Route::put('/{id}', 'update');
        Route::delete('/{id}', 'destroy');
        Route::put('/restore/{id}', 'restore');
        Route::delete('/forceDelete/{id}', 'forceDelete');
        Route::get('/trashed', 'trashed');
    });
    // product views
    Route::prefix('productsviews')->controller(ProductsViewsController::class)->group(function () {

        Route::delete('/{view_id}', 'deleteView'); // xóa sản phẩm đã xem theo view_id
        Route::delete('/deleteall', 'deleteAllViews'); // xóa tất cả sản phẩm đã xem

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
Route::get('voucher', [VoucherController::class, 'index']); // lấy danh sách voucher
Route::get('voucher/{id}', [VoucherController::class, 'show']); // lấy voucher theo id

// Product Views
Route::prefix('productsviews')->controller(ProductsViewsController::class)->group(function () {
    Route::post('/', 'addview'); // thêm sản phẩm đã xem
    Route::get('/getbyuser/{user_id}', 'getViewsByUserId'); // lấy sản phẩm đã xem theo user_id
});


// product like
Route::middleware('auth:sanctum')->group(function () {
    Route::post('productlike/{id}', [ProductLikeController::class, 'productlike']);
    Route::delete('productunlike/{id}', [ProductLikeController::class, 'productunlike']);
    Route::get('listproductlike', [ProductLikeController::class, 'listproductlike']);
    Route::put('updatestatuslike/{id}', [ProductLikeController::class, 'updatestatuslike']);
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
            Route::post('addPayment', [PaymentMethodController::class, 'addPayment']);
        });
    });

    // đơn hàng
    Route::middleware('auth:sanctum')->group(function () {
        // Client
        Route::get('getOrder', [OrderController::class, 'getOrder']);
        Route::get('getDetailOrder/{id}', [OrderController::class, 'getDetailOrder']);


        // Client gửi yêu cầu hoàn hàng cho đơn hàng (kèm lý do hoàn hàng)
        Route::post('/orders/{id}/request-return', [OrderController::class, 'clientRequestReturn']);
        // Client xác nhận đã nhận hàng (chuyển trạng thái đơn hàng sang Hoàn thành)
        Route::post('/orders/{id}/confirm-received', [OrderController::class, 'clientConfirmReceived']);
        // Client hủy đơn hàng khi đang ở trạng thái Chờ lấy hàng
        Route::post('/orders/{id}/cancel', [OrderController::class, 'clientCancelOrder']);
    });


    // Thông báo
    Route::get('admin/notifications', [NotificationController::class, 'index']);
    Route::post('admin/notifications/read/{id}', [NotificationController::class, 'markAsRead']);
    Route::post('admin/notifications/readAll', [NotificationController::class, 'markAsReadAll']);
});

// quản lý đơn hàng dành cho admin
Route::middleware(['auth:sanctum', CheckAdmin::class])->prefix('admin')->group(function () {
    Route::get('orders', [OrderController::class, 'adminIndex']); // Danh sách đơn hàng
    Route::get('orders/{id}', [OrderController::class, 'adminShow']); // Chi tiết đơn hàng
    Route::put('orders/{id}/status', [OrderController::class, 'adminUpdateStatus']); // Cập nhật trạng thái đơn hàng


    // Admin duyệt hoặc từ chối yêu cầu hoàn hàng của đơn hàng
    Route::put('/orders/{id}/handle-return', [OrderController::class, 'adminHandleReturnRequest']);
    // danh sách hoàn hàng 
    Route::get('return-orders', [OrderController::class, 'getReturnOrdersByStatus']);
    // chi tiết hoàn hàng 
    Route::get('orders/return-orders/{order_id}', [OrderController::class, 'getReturnOrderDetail']);
    // lấy danh sách lịch sử cập nhật đơn hàng (theo order_id)
    Route::get('orders/{order_id}/status-history', [OrderController::class, 'getOrderStatusHistory']);
    // Lấy tất cả lịch sử thay đổi trạng thái của mọi đơn hàng (admin)
    Route::get('/status-histories', [OrderController::class, 'getAllOrderStatusHistories']);
});




// comment
Route::middleware('auth:sanctum')->post('/comments', [CommentController::class, 'store']);
Route::get('/comments/{id}', [CommentController::class, 'index']);


// chatbot
Route::post('/public/chatbot', [ChatbotController::class, 'handle']);
Route::middleware('auth:sanctum')->get('/public/chatbot/conversation', [ChatbotController::class, 'getConversation']);
Route::middleware(['auth:sanctum', CheckAdmin::class])->prefix('admin')->group(function () {
    Route::get('/chatbots', [ChatbotController::class, 'index']);

    Route::post('/chatbots/toggle/{id}', [ChatbotController::class, 'toggle']);
});



// chatlive
// Tất cả route yêu cầu đăng nhập (auth:sanctum)
Route::middleware('auth:sanctum')->prefix('support-chat')->group(function () {

    // Gửi tin nhắn mới (có thể kèm file)
    Route::post('/send', [SupportChatController::class, 'sendMessage']);

    // Lấy lịch sử chat giữa người dùng hiện tại và user khác
    Route::get('/history/{user_id}', [SupportChatController::class, 'getChatHistory']);

    // Đếm số tin nhắn chưa đọc (dựa trên bảng support_chat_notifications)
    Route::get('/unread-count', [SupportChatController::class, 'getUnreadCount']);

    // Đánh dấu 1 tin nhắn là đã đọc
    Route::patch('/mark-as-read/{chat_id}', [SupportChatController::class, 'markAsRead']);
});
