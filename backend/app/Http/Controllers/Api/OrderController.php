<?php

namespace App\Http\Controllers\Api;


use App\Models\User;
use App\Models\Orders;
use App\Models\Wallet;
use Cloudinary\Cloudinary;
use App\Models\LoyaltyTier;
use App\Events\OrderUpdated;

use App\Models\LoyaltyPoint;
use Illuminate\Http\Request;
use App\Models\ReturnRequest;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\DB;
use App\Events\ReturnRequestUpdated;
use App\Http\Controllers\Controller;
use App\Mail\OrderStatusUpdatedMail;
use Illuminate\Support\Facades\Mail;
use App\Mail\OrderCancelledByAdminMail;
use App\Models\OrderStatusHistory; // Thêm dòng này để sử dụng model OrderStatusHistory

class OrderController extends Controller
{
    public function getOrder(Request $request)
    {
        // Tự động hoàn thành các đơn đã giao quá 3 ngày
        Orders::autoCompleteIfNeeded();
        $user = $request->user();
        $orders = Orders::with(['paymentMethods'])
            ->orderByDesc('created_at')
            ->where('user_id', $user->user_id)
            ->get();

        $formattedOrders = $orders->map(function ($order) {
            return [
                'order_id' => $order->order_id,
                'order_code' => $order->order_code,
                'customer' => $order->customer,
                'email' => $order->email,
                'total_amount' => number_format($order->total_amount, 0, ".", ""),
                'address' => $order->address . ', ' .
                    $order->ward . ', ' .
                    $order->district . ', ' .
                    $order->city,
                'payment_status' => $order->payment_status,
                'payment_method' => optional($order->paymentMethods)->name,
                'status' => $order->status,
                'cancel_reason' => $order->cancel_reason,
                'created_at' => $order->created_at,
                'updated_at' => $order->updated_at,
            ];
        });
        return response()->json([
            'status' => true,
            'orders' => $formattedOrders
        ]);
    }


    public function getDetailOrder(Request $request, $id)
    {
        // Tự động hoàn thành các đơn đã giao quá 3 ngày
        Orders::autoCompleteIfNeeded();
        $user = $request->user();
        $order = Orders::with(['user', 'paymentMethods', 'orderItems.product', 'orderItems.variant.variantAttributeValues.value.attribute'])
            ->where('user_id', $user->user_id)
            ->where('order_id', $id)
            ->first();

        if (!$order) {
            return response()->json([
                'status' => false,
                'message' => 'Không tìm thấy đơn hàng'
            ], 404);
        }

        // Định dạng chi tiết sản phẩm
        $orderItems = $order->orderItems->map(function ($item) {
            $variantAttributes = [];
            if ($item->variant) {
                $variantAttributes = $item->variant->variantAttributeValues->map(function ($attrValue) {
                    return [
                        'attribute_name' => $attrValue->value->attribute->name,
                        'attribute_value' => $attrValue->value->value
                    ];
                });
            }
            return [
                'variant_id' => $item->variant_id,
                'product_id' => $item->product_id,
                'product_name' => $item->product->name,
                'product_image' => $item->variant ? $item->variant->image_url : $item->product->image_url,
                'quantity' => $item->quantity,
                'price' => number_format($item->price, 0, ".", ""),
                'subtotal' => number_format($item->price * $item->quantity, 0, ".", ""),
                'variant_attributes' => $variantAttributes
            ];
        });
        $formattedOrder = [
            'order_id' => $order->order_id,
            'order_code' => $order->order_code,
            'order_date' => $order->created_at,
            'customer' => $order->customer,
            'email' => $order->email,
            'phone' => $order->phone,
            'address' => $order->address . ', ' .
                $order->ward . ', ' .
                $order->district . ', ' .
                $order->city,
            'payment_method' => [
                $order->paymentMethods->name,
                $order->paymentMethods->description
            ],
            'payment_status' => $order->payment_status,
            'status' => $order->status,
            'cancel_reason' => $order->cancel_reason,
            'voucher' => $order->voucher_id,
            'voucher_discount' => number_format($order->voucher_discount, 0, ".", ""),
            'rank_discount' => number_format($order->rank_discount, 0, ".", ""),
            'total_amount' => number_format($order->total_amount, 0, ".", ""),
            'products' => $orderItems,
            'updated_at' => $order->updated_at, // Add updated_at to the formatted order details
        ];

        return response()->json([
            'status' => true,
            'order' => $formattedOrder
        ]);
    }

    // quản lý đơn hàng admin
    public function adminIndex(Request $request)
    {
        // Tự động hoàn thành các đơn đã giao quá 3 ngày
        Orders::autoCompleteIfNeeded();
        $query = Orders::with(['user', 'paymentMethods', 'orderItems']);

        // Lọc theo trạng thái đơn hàng
        if ($request->has('status') && $request->status !== null) {
            $query->where('status', $request->status);
        }
        // Lọc theo trạng thái thanh toán
        if ($request->has('payment_status') && $request->payment_status !== null) {
            $query->where('payment_status', $request->payment_status);
        }
        // Tìm kiếm theo mã đơn hàng
        if ($request->has('order_code') && $request->order_code !== null) {
            $query->where('order_code', 'like', '%' . $request->order_code . '%');
        }
        // Tìm kiếm theo tên khách hàng
        if ($request->has('customer') && $request->customer !== null) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('full_name', 'like', '%' . $request->customer . '%');
            });
        }

        $orders = $query->orderByDesc('created_at')->paginate(15);

        $formattedOrders = $orders->map(function ($order) {
            $products = $order->orderItems->map(function ($item) {
                return [
                    'product_id' => $item->product_id,
                    'product_name' => $item->product ? $item->product->name : null,
                    'product_image' => $item->variant ? $item->variant->image_url : ($item->product ? $item->product->image_url : null),
                    'quantity' => $item->quantity,
                ];
            });
            return [
                'order_id' => $order->order_id,
                'order_code' => $order->order_code,
                'customer' =>  $order->customer,
                "image_url" => $order->user->image_url,
                'email' => $order->email,
                'total_amount' => number_format($order->total_amount, 0, '.', ''),
                'payment_status' => $order->payment_status,
                'payment_method' => $order->paymentMethods ? $order->paymentMethods->name : null,
                'status' => $order->status,
                'cancel_reason' => $order->cancel_reason,
                'created_at' => $order->created_at->format('d/m/Y H:i:s'),
                'updated_at' => $order->updated_at->format('d/m/Y H:i:s'), // Add updated_at to the formatted orders for adminIndex
                'totalProduct' => $order->orderItems->sum('quantity'), // Tính tổng số lượng sản phẩm
                'products' => $products,
            ];
        });

        return response()->json([
            'status' => true,
            'orders' => $formattedOrders,
            'pagination' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
            ]
        ]);
    }

    // Xem chi tiết đơn hàng cho admin
    public function adminShow($id)
    {
        // Tự động hoàn thành các đơn đã giao quá 3 ngày
        Orders::autoCompleteIfNeeded();
        $order = Orders::with(['user', 'paymentMethods', 'orderItems.product', 'orderItems.variant.variantAttributeValues.value.attribute'])
            ->where('order_id', $id)
            ->first();

        if (!$order) {
            return response()->json([
                'status' => false,
                'message' => 'Không tìm thấy đơn hàng'
            ], 404);
        }

        $orderItems = $order->orderItems->map(function ($item) {
            $variantInfo = '';
            $variantAttributes = [];
            if ($item->variant) {
                $variantInfo = ' - ' . $item->variant->sku;
                $variantAttributes = $item->variant->variantAttributeValues->map(function ($attrValue) {
                    return [
                        'attribute_name' => $attrValue->value->attribute->name,
                        'attribute_value' => $attrValue->value->value
                    ];
                });
            }
            return [
                'product_name' => $item->product->name . $variantInfo,
                'product_image' => $item->variant ? $item->variant->image_url : $item->product->image_url,
                'quantity' => $item->quantity,
                'price' => number_format($item->price, 0, '.', ''),
                'subtotal' => number_format($item->price * $item->quantity, 0, '.', ''),
                'variant_attributes' => $variantAttributes
            ];
        });

        $formattedOrder = [
            'order_id' => $order->order_id,
            'user_id' => $order->user_id,
            'order_code' => $order->order_code,
            'order_date' => $order->created_at->format('d/m/Y H:i:s'),
            'customer' => $order->customer,
            'email' => $order->email,
            'phone' => $order->phone,
            'address' => $order ? ($order->address . ', ' . $order->ward . ', ' . $order->district . ', ' . $order->city) : null,
            'payment_method' => $order->paymentMethods ? [$order->paymentMethods->name, $order->paymentMethods->description] : null,
            'payment_status' => $order->payment_status,
            'status' => $order->status,
            'cancel_reason' => $order->cancel_reason,
            'voucher' => $order->voucher_id,
            'voucher_discount' => number_format($order->voucher_discount, 0, ".", ""),
            'rank_discount' => number_format($order->rank_discount, 0, ".", ""),
            'total_amount' => number_format($order->total_amount, 0, '.', ''),
            'products' => $orderItems
        ];

        return response()->json([
            'status' => true,
            'order' => $formattedOrder
        ]);
    }

    // Cập nhật trạng thái đơn hàng (admin)
    public function adminUpdateStatus(Request $request, $id)
    {
        $order = Orders::find($id);
        if (!$order) {
            return response()->json([
                'status' => false,
                'message' => 'Không tìm thấy đơn hàng'
            ], 404);
        }
        $request->validate([
            'status' => 'required|string',
            'payment_status' => 'nullable|string',
        ]);

        $currentStatus = $order->status;
        $nextStatus = $request->status;
        // Chỉ cho phép admin thao tác từ Chờ xác nhận đến Đã giao hàng
        $allowedStatuses = ['Chờ xác nhận', 'Đã xác nhận', 'Đang vận chuyển', 'Đã giao hàng'];
        $validTransitions = [
            'Chờ xác nhận' => ['Đã xác nhận'],
            'Đã xác nhận' => ['Đang vận chuyển'],
            'Đang vận chuyển' => ['Đã giao hàng'],
            'Đã giao hàng' => ['Hoàn thành'],
            'Hoàn thành' => [],
            'Đã hủy' => [],
        ];

        if (!in_array($currentStatus, $allowedStatuses) || !in_array($nextStatus, $allowedStatuses)) {
            return response()->json([
                'status' => false,
                'message' => 'Admin chỉ được thao tác trạng thái từ Chờ xác nhận đến Đã giao hàng.'
            ], 400);
        }

        if (!isset($validTransitions[$currentStatus]) || !in_array($nextStatus, $validTransitions[$currentStatus])) {
            return response()->json([
                'status' => false,
                'message' => 'Chuyển trạng thái không hợp lệ!'
            ], 400);
        }
        $order->status = $nextStatus;

        if ($nextStatus === 'Đã giao hàng') {
            if ($order->payment_status === 'Chưa thanh toán') {
                $order->payment_status = 'Đã thanh toán';
            }
            // Ghi lại ngày giờ giao hàng để sau này tính 3 ngày auto hoàn thành
            $order->delivered_at = now();
        } elseif ($request->has('payment_status')) {
            $order->payment_status = $request->payment_status;
        }

        $order->save();
        // Broadcast event for realtime update
        event(new OrderUpdated($order, $order->user_id));
        // start lưu lại lịch sử đơn hàng
        // Ghi lại lịch sử thay đổi trạng thái đơn hàng
        // Đoạn này giúp bạn lưu lại mỗi lần trạng thái đơn hàng thay đổi để tra cứu lịch sử sau này
        OrderStatusHistory::create([
            'order_id' => $order->order_id, // ID đơn hàng
            'old_status' => $currentStatus, // Trạng thái cũ
            'new_status' => $nextStatus,    // Trạng thái mới
            'changed_by' => $request->user() ? $request->user()->user_id : null, // ID người thay đổi (admin), có thể null nếu không đăng nhập
        ]);

        // end lưu lại lịch sử đơn hàng

        // Tải lại quan hệ user và paymentMethods sau khi cập nhật
        $order->load(['user', 'paymentMethods']);
        $orderArr = $order->toArray();
        $orderArr['user_id'] = $order->user ? $order->user->full_name : null;
        $orderArr['method_id'] = $order->paymentMethods ? $order->paymentMethods->name : null;

        // Gửi email thông báo trạng thái đơn hàng cho khách hàng
        if ($order->user && $order->user->email) {
            try {
                Mail::to($order->user->email)->send(new OrderStatusUpdatedMail($order, $nextStatus));
            } catch (\Exception $e) {
                // Có thể log lỗi gửi mail nếu cần
            }
        }

        return response()->json([
            'status' => true,
            'message' => 'Cập nhật trạng thái thành công',
            'order' => $orderArr
        ]);
    }

    // Client xác nhận đã nhận hàng (chuyển Đã giao hàng -> Hoàn thành/ Giao hàng thành công)
    public function clientConfirmReceived(Request $request, $id)
    {
        $order = Orders::find($id);
        if (!$order) {
            return response()->json([
                'status' => false,
                'message' => 'Không tìm thấy đơn hàng'
            ], 404);
        }
        if ($order->status !== 'Đã giao hàng') {
            return response()->json([
                'status' => false,
                'message' => 'Chỉ xác nhận khi đơn hàng ở trạng thái Đã giao hàng'
            ], 400);
        }
        $order->status = 'Hoàn thành';
        $order->save();
        // Broadcast event for realtime update
        event(new OrderUpdated($order, $order->user_id));
        return response()->json([
            'status' => true,
            'message' => 'Đơn hàng đã được xác nhận hoàn thành',
            'order' => $order
        ]);
    }

    // Client gửi yêu cầu hoàn hàng (sử dụng bảng return_requests)
    public function clientRequestReturn(Request $request, $id)
    {
        $order = Orders::find($id);
        if (!$order) {
            return response()->json([
                'status' => false,
                'message' => 'Không tìm thấy đơn hàng'
            ], 404);
        }

        // Chỉ cho phép khi đơn đã giao hoặc hoàn thành
        if (!in_array($order->status, ['Đã giao hàng', 'Hoàn thành'])) {
            return response()->json([
                'status' => false,
                'message' => 'Chỉ được yêu cầu hoàn hàng khi đơn hàng ở trạng thái Đã giao hàng hoặc Hoàn thành'
            ], 400);
        }

        // Danh sách lý do hợp lệ
        $reasons = [
            'Thiếu hàng',
            'Người bán gửi sai hàng',
            'Hàng bể vỡ',
            'Hàng lỗi, không hoạt động',
            'Hàng giả, nhái',
            'Hàng khác với mô tả',
            'Hàng đã qua sử dụng',
            'Lý do khác'
        ];

        // Vì form-data không parse được array object nên ta phải decode thủ công
        $returnItems = json_decode($request->input('return_items'), true);

        if (!is_array($returnItems) || empty($returnItems)) {
            return response()->json([
                'status' => false,
                'message' => 'Dữ liệu return_items không hợp lệ.'
            ], 422);
        }

        // Validate cơ bản cho return_reason và file
        $request->validate([
            'return_reason' => 'required|string',
            'return_reason_other' => 'nullable|string|max:255',
            'upload_url.*' => 'file|mimes:jpg,png,jpeg|max:4096',
        ]);

        // Validate từng item trong return_items
        foreach ($returnItems as $item) {
            if (
                !isset($item['product_id']) || !is_numeric($item['product_id']) ||
                !isset($item['variant_id']) || !is_numeric($item['variant_id']) ||
                !isset($item['quantity']) || !is_numeric($item['quantity']) || $item['quantity'] < 1
            ) {
                return response()->json([
                    'status' => false,
                    'message' => 'Dữ liệu return_items không hợp lệ.'
                ], 422);
            }
        }

        // Upload ảnh lên Cloudinary
        $imageUrls = [];
        if ($request->hasFile('upload_url')) {
            try {
                $cloudinary = app(Cloudinary::class);
                $uploadApi = $cloudinary->uploadApi();

                foreach ($request->file('upload_url') as $imageFile) {
                    $result = $uploadApi->upload($imageFile->getRealPath(), [
                        'folder' => 'comments_img'
                    ]);
                    $imageUrls[] = $result['secure_url'];
                }
            } catch (\Exception $e) {
                return response()->json([
                    'message' => 'Lỗi khi upload ảnh: ' . $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine()
                ], 500);
            }
        }

        $reason = $request->return_reason;

        // Kiểm tra lý do hợp lệ
        if (!in_array($reason, $reasons)) {
            return response()->json([
                'status' => false,
                'message' => 'Lý do hoàn hàng không hợp lệ.'
            ], 400);
        }

        if ($reason === 'Lý do khác' && empty($request->return_reason_other)) {
            return response()->json([
                'status' => false,
                'message' => 'Vui lòng nhập lý do hoàn hàng cụ thể.'
            ], 400);
        }

        // Kiểm tra sản phẩm trong đơn và tính tiền hoàn
        $orderItems = $order->orderItems->keyBy(function ($item) {
            return $item->product_id . '-' . $item->variant_id;
        });

        $refundAmount = 0;
        $validReturnItems = [];
        foreach ($returnItems as $item) {
            $key = $item['product_id'] . '-' . $item['variant_id'];
            if (!isset($orderItems[$key])) {
                return response()->json([
                    'status' => false,
                    'message' => 'Sản phẩm hoặc biến thể không tồn tại trong đơn hàng.'
                ], 400);
            }

            $orderItem = $orderItems[$key];
            if ($item['quantity'] > $orderItem->quantity) {
                return response()->json([
                    'status' => false,
                    'message' => 'Số lượng hoàn vượt quá số lượng đã mua.'
                ], 400);
            }

            $refundAmount += $orderItem->price * $item['quantity'];

            $validReturnItems[] = [
                'product_id' => $item['product_id'],
                'variant_id' => $item['variant_id'],
                'quantity' => $item['quantity']
            ];
        }

        // Kiểm tra đã có yêu cầu hoàn hàng chưa
        $existingRequest = DB::table('return_requests')
            ->where('order_id', $order->order_id)
            ->where('user_id', $request->user()->user_id)
            ->first();
        if ($existingRequest) {
            return response()->json([
                'status' => false,
                'message' => 'Bạn đã gửi yêu cầu hoàn hàng cho đơn này rồi.'
            ], 400);
        }

        // Tạo mới yêu cầu hoàn hàng
        $returnId = DB::table('return_requests')->insertGetId([
            'order_id' => $order->order_id,
            'user_id' => $request->user()->user_id,
            'reason' => $reason,
            'return_reason_other' => $request->return_reason_other,
            'status' => 'đã yêu cầu',
            'refund_amount' => $refundAmount,
            'upload_url' => json_encode($imageUrls),
            'return_items' => json_encode($validReturnItems),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('orders')->where('order_id', $order->order_id)->update([
            'status' => 'Yêu cầu hoàn hàng',
        ]);

        $order = Orders::find($order->order_id);
        event(new OrderUpdated($order, $order->user_id));

        return response()->json([
            'status' => true,
            'message' => 'Đã gửi yêu cầu hoàn hàng',
            'return_request_id' => $returnId
        ]);
    }


    // Admin duyệt hoặc từ chối hoàn hàng (sử dụng bảng return_requests)
    public function adminHandleReturnRequest(Request $request, $id)
    {
        $allowedStatuses = ['Đã yêu cầu', 'Đã chấp thuận', 'Đã từ chối', 'Đang xử lý', 'Đã hoàn lại', 'Đã hủy'];
        $validTransitions = [
            'Đã yêu cầu'   => ['Đã chấp thuận', 'Đã từ chối'],
            'Đã chấp thuận' => ['Đang xử lý', 'Đã từ chối'],
            'Đang xử lý'   => ['Đã hoàn lại', 'Đã từ chối'],
            'Đã hoàn lại'  => [],
            'Đã từ chối'   => [],
            'Đã hủy'       => [],
        ];

        $newStatus = $request->input('status');

        if (!in_array($newStatus, $allowedStatuses)) {
            return response()->json([
                'status' => false,
                'message' => 'Trạng thái không hợp lệ.'
            ], 422);
        }

        $returnRequest = ReturnRequest::where('order_id', $id)
            ->whereIn('status', array_keys($validTransitions))
            ->first();

        if (!$returnRequest) {
            return response()->json([
                'status' => false,
                'message' => 'Không tìm thấy yêu cầu hoàn hàng đang chờ xử lý cho đơn hàng này'
            ], 404);
        }

        $currentStatus = $returnRequest->status;
        if (!isset($validTransitions[$currentStatus]) || !in_array($newStatus, $validTransitions[$currentStatus])) {
            return response()->json([
                'status' => false,
                'message' => 'Chuyển trạng thái không hợp lệ!'
            ], 400);
        }

        $refundAmount = $returnRequest->refund_amount;
        $userId = $returnRequest->user_id;

        DB::beginTransaction();
        try {
            // 1. Cập nhật trạng thái yêu cầu hoàn hàng
            $returnRequest->status = $newStatus;
            $returnRequest->updated_at = now();
            $returnRequest->save();

            // 2. Cập nhật đơn hàng
            $order = Orders::find($id);
            if ($order) {
                if ($newStatus === 'Đã yêu cầu') {
                    $order->status = 'Đã yêu cầu hoàn hàng';
                } elseif ($newStatus === 'Đã chấp thuận') {
                    $order->status = 'Đã chấp thuận';
                } elseif ($newStatus === 'Đang xử lý') {
                    $order->status = 'Đang xử lý';
                } elseif ($newStatus === 'Đã từ chối') {
                    $order->status = 'Đã từ chối';
                } elseif ($newStatus === 'Đã hoàn lại') {
                    $order->status = 'Đã trả hàng';
                    $order->payment_status = 'Đã hoàn tiền';

                    // 3. Xử lý hoàn tiền vào ví
                    $wallet = Wallet::firstOrCreate(['user_id' => $userId], ['balance' => 0]);
                    $wallet->balance += $refundAmount;
                    $wallet->save();

                    // 4. Ghi log giao dịch ví
                    WalletTransaction::create([
                        'wallet_id' => $wallet->wallet_id,
                        'type' => 'hoàn tiền',
                        'amount' => $refundAmount,
                        'note' => 'Hoàn tiền đơn hàng #' . $order->order_code,
                        'return_id' => $returnRequest->return_id,
                    ]);
                } elseif (in_array($newStatus, ['Đã từ chối', 'Đã hủy'])) {
                    $order->status = 'Từ chối hoàn hàng';
                }

                $order->save();

                // ✅ Gọi sự kiện realtime ở đây cho mọi trạng thái
                event(new ReturnRequestUpdated($order->order_id, [
                    'status' => $order->status,
                    'payment_status' => $order->payment_status,
                    'return_status' => $newStatus,
                    'refund_amount' => $newStatus === 'Đã hoàn lại' ? $refundAmount : 0,
                    'updated_at' => now(),
                ]));
            }


            DB::commit();

            return response()->json([
                'status' => true,
                'message' => $newStatus === 'Đã hoàn lại' ? 'Đã duyệt hoàn tiền' : ($newStatus === 'Đã từ chối' ? 'Đã từ chối hoàn hàng' : 'Cập nhật trạng thái yêu cầu hoàn hàng thành công'),
                'return_request_id' => $returnRequest->return_id,
                'return_request_status' => $newStatus,
                'refund_amount' => $newStatus === 'Đã hoàn lại' ? $refundAmount : null
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => 'Đã xảy ra lỗi khi xử lý: ' . $e->getMessage()
            ], 500);
        }
    }


    // Client hủy đơn hàng khi đang ở trạng thái Chờ xác nhận
    public function clientCancelOrder(Request $request, $id)
    {
        $order = Orders::find($id);
        if (!$order) {
            return response()->json([
                'status' => false,
                'message' => 'Không tìm thấy đơn hàng'
            ], 404);
        }
        // Chỉ cho phép hủy khi trạng thái là Chờ xác nhận
        if (!in_array($order->status, ['Chờ xác nhận'])) {
            return response()->json([
                'status' => false,
                'message' => 'Chỉ được hủy đơn hàng khi ở trạng thái Chờ xác nhận, Đã xác nhận hoặc Chờ lấy hàng'
            ], 400);
        }
        // Kiểm tra quyền: chỉ chủ đơn hàng mới được hủy
        if ($order->user_id !== $request->user()->user_id) {
            return response()->json([
                'status' => false,
                'message' => 'Bạn không có quyền hủy đơn hàng này'
            ], 403);
        }
        // Validate lý do hủy
        $request->validate([
            'cancel_reason' => 'required|string|max:255'
        ]);
        $order->status = 'Đã hủy';
        $order->cancel_reason = $request->cancel_reason; // sử dụng trường có sẵn
        $order->save();
        // Nếu đã trả bằng ví thì hoàn tiền lại vào ví
        if ($order->paid_by_wallet > 0) {
            $wallet = Wallet::firstOrCreate(
                ['user_id' => $order->user_id],
                ['balance' => 0.00]
            );
            $wallet->balance += $order->paid_by_wallet;
            $wallet->save();

            WalletTransaction::create([
                'wallet_id' => $wallet->wallet_id,
                'type' => 'hoàn tiền',
                'amount' => $order->paid_by_wallet,
                'note' => 'Hoàn tiền do hủy đơn hàng #' . $order->order_code
            ]);
        }
        // Broadcast event for realtime update
        event(new OrderUpdated($order, $order->user_id));
        return response()->json([
            'status' => true,
            'message' => 'Đơn hàng đã được hủy thành công',
            'order' => $order
        ]);
    }

    // Danh sách yêu cầu hoàn trả kèm thông tin đơn hàng (admin) - tối ưu, chỉ trả về thông tin cơ bản và trạng thái yêu cầu hoàn trả gần nhất
    public function getReturnOrdersByStatus(Request $request)
    {
        $status = $request->input('status'); // 'Đã hoàn lại', 'Đã từ chối', hoặc null
        // Subquery lấy return_request mới nhất theo created_at cho mỗi order_id (không dùng LIMIT trong IN)
        $latestReturnRequestSub = DB::table('return_requests as rr1')
            ->select('rr1.order_id', DB::raw('MAX(rr1.created_at) as max_created_at'))
            ->groupBy('rr1.order_id');

        $query = DB::table('orders')
            ->joinSub($latestReturnRequestSub, 'latest_return', function ($join) {
                $join->on('orders.order_id', '=', 'latest_return.order_id');
            })
            ->join('return_requests', function ($join) {
                $join->on('orders.order_id', '=', 'return_requests.order_id')
                    ->on('return_requests.created_at', '=', 'latest_return.max_created_at');
            })
            ->leftJoin('users', 'orders.user_id', '=', 'users.user_id')
            ->leftJoin('payment_methods', 'orders.method_id', '=', 'payment_methods.method_id')
            ->select(
                'orders.order_id',
                'orders.order_code',
                'orders.customer',
                'users.email',
                'orders.total_amount',
                'orders.status as order_status',
                'orders.payment_status',
                'payment_methods.name as payment_method',
                'orders.cancel_reason',
                'orders.created_at as order_created_at',
                'return_requests.return_id',
                'return_requests.status as return_status',
                'return_requests.created_at as return_created_at'
            );
        if ($status) {
            $query->where('return_requests.status', $status);
        } else {
            $query->whereIn('return_requests.status', ['Đã hoàn lại', 'Đã từ chối']);
        }
        $results = $query
            ->orderByDesc('orders.created_at')
            ->get();

        $formatted = $results->map(function ($row) {
            return [
                'order_id' => $row->order_id,
                'order_code' => $row->order_code,
                'customer' => $row->customer,
                'email' => $row->email,
                'total_amount' => number_format($row->total_amount, 0, '.', ''),
                'order_status' => $row->order_status,
                'payment_status' => $row->payment_status,
                'payment_method' => $row->payment_method,
                'cancel_reason' => $row->cancel_reason,
                'order_created_at' => $row->order_created_at ? date('d/m/Y H:i:s', strtotime($row->order_created_at)) : null,
                'latest_return_request' => [
                    'return_id' => $row->return_id,
                    'status' => $row->return_status,
                    'created_at' => $row->return_created_at ? date('d/m/Y H:i:s', strtotime($row->return_created_at)) : null,
                ]
            ];
        });

        return response()->json([
            'status' => true,
            'orders' => $formatted
        ]);
    }

    // Danh sách hoàn hàng (admin) - chỉ trả về các đơn hàng có ít nhất 1 yêu cầu hoàn trả
    public function getReturnOrdersList(Request $request)
    {
        $status = $request->input('status'); // 'Đã hoàn lại', 'Đã từ chối', hoặc null
        $query = DB::table('orders')
            ->join('return_requests', 'orders.order_id', '=', 'return_requests.order_id')
            ->leftJoin('users', 'orders.user_id', '=', 'users.user_id')
            ->leftJoin('payment_methods', 'orders.method_id', '=', 'payment_methods.method_id')
            ->select(
                'orders.order_id',
                'orders.order_code',
                'orders.customer',
                'users.email',
                'orders.total_amount',
                'orders.status as order_status',
                'orders.payment_status',
                'payment_methods.name as payment_method',
                'orders.cancel_reason',
                'orders.created_at as order_created_at',
                DB::raw('GROUP_CONCAT(return_requests.status) as return_statuses'),
                DB::raw('GROUP_CONCAT(return_requests.return_id) as return_ids')
            );
        if ($status) {
            $query->where('return_requests.status', $status);
        } else {
            $query->whereIn('return_requests.status', ['Đã hoàn lại', 'Đã từ chối']);
        }
        $query->groupBy('orders.order_id');
        $results = $query->orderByDesc('orders.created_at')->get();

        $formatted = $results->map(function ($row) {
            return [
                'order_id' => $row->order_id,
                'order_code' => $row->order_code,
                'customer' => $row->customer,
                'email' => $row->email,
                'total_amount' => number_format($row->total_amount, 0, '.', ''),
                'order_status' => $row->order_status,
                'payment_status' => $row->payment_status,
                'payment_method' => $row->payment_method,
                'cancel_reason' => $row->cancel_reason,
                'order_created_at' => $row->order_created_at ? date('d/m/Y H:i:s', strtotime($row->order_created_at)) : null,
                'return_request_statuses' => explode(',', $row->return_statuses),
                'return_request_ids' => explode(',', $row->return_ids),
            ];
        });

        return response()->json([
            'status' => true,
            'orders' => $formatted
        ]);
    }

    // Chi tiết đơn hàng hoàn trả (admin)
    public function getReturnOrderDetail($order_id)
    {
        //Lấy đơn hàng với các quan hệ liên quan
        $order = Orders::with([
            'user',
            'paymentMethods',
            'orderItems.product',
            'orderItems.variant.variantAttributeValues.value.attribute'
        ])->where('order_id', $order_id)->first();

        //  Nếu không tìm thấy đơn hàng
        if (!$order) {
            return response()->json([
                'status' => false,
                'message' => 'Không tìm thấy đơn hàng'
            ], 404);
        }

        //Lấy các yêu cầu hoàn trả liên quan đến đơn hàng
        $returnRequests = DB::table('return_requests')
            ->where('order_id', $order_id)
            ->orderByDesc('created_at')
            ->get();

        //Format danh sách sản phẩm trong đơn hàng
        $orderItems = $order->orderItems->map(function ($item) {
            // Lấy thông tin thuộc tính của biến thể (nếu có)
            $variantAttributes = $item->variant
                ? $item->variant->variantAttributeValues->map(function ($attrValue) {
                    return [
                        'attribute_name' => optional(optional($attrValue->value)->attribute)->name,
                        'attribute_value' => optional($attrValue->value)->value
                    ];
                })
                : [];

            return [
                'variant_id' => $item->variant_id,
                'product_id' => $item->product_id,
                'product_name' => optional($item->product)->name,
                'product_image' => $item->variant
                    ? $item->variant->image_url
                    : optional($item->product)->image_url,
                'quantity' => $item->quantity,
                'price' => $item->price !== null
                    ? number_format($item->price, 0, '.', '')
                    : null,
                'subtotal' => $item->price !== null
                    ? number_format($item->price * $item->quantity, 0, '.', '')
                    : null,
                'variant_attributes' => $variantAttributes
            ];
        });

        //Format danh sách yêu cầu hoàn trả
        $returnRequestsFormatted = $returnRequests->map(function ($r) {
            return [
                'return_id' => $r->return_id,
                'reason' => $r->reason,
                'return_reason_other' => $r->return_reason_other, //Thêm lý do khác
                'status' => $r->status,
                'upload_url' => $r->upload_url,
                'refund_amount' => $r->refund_amount !== null
                    ? number_format($r->refund_amount, 0, '.', '')
                    : null,
                'created_at' => $r->created_at
                    ? date('d/m/Y H:i:s', strtotime($r->created_at))
                    : null,
            ];
        });

        //Định dạng dữ liệu trả về
        $formattedOrder = [
            'order_id' => $order->order_id,
            'order_code' => $order->order_code,
            'customer' => $order->customer ?? optional($order->user)->name,
            'email' => optional($order->user)->email,
            'total_amount' => $order->total_amount !== null
                ? number_format($order->total_amount, 0, '.', '')
                : null,
            'order_status' => $order->status,
            'payment_status' => $order->payment_status,
            'payment_method_name' => optional($order->paymentMethods)->name,
            'payment_method_description' => optional($order->paymentMethods)->description,
            'cancel_reason' => $order->cancel_reason,
            'order_created_at' => $order->created_at
                ? $order->created_at->format('d/m/Y H:i:s')
                : null,
            'products' => $orderItems,
            'return_requests' => $returnRequestsFormatted
        ];

        //Trả về response JSON
        return response()->json([
            'status' => true,
            'order' => $formattedOrder
        ]);
    }



    // phần này là lấy danh sách lịch sử trạng thái đã cập nhật



    // Lấy lịch sử thay đổi trạng thái của đơn hàng
    // API này giúp bạn lấy toàn bộ lịch sử thay đổi trạng thái của một đơn hàng để hiển thị cho admin hoặc khách hàng
    public function getOrderStatusHistory($orderId)
    {
        // Join với bảng users để lấy tên người thay đổi
        $history = DB::table('order_status_histories')
            ->leftJoin('users', 'order_status_histories.changed_by', '=', 'users.user_id')
            ->where('order_status_histories.order_id', $orderId)
            ->orderBy('order_status_histories.created_at', 'asc')
            ->select(
                'order_status_histories.old_status',
                'order_status_histories.new_status',
                'order_status_histories.changed_by',
                'users.full_name as changed_by_name',
                'order_status_histories.created_at',
                'order_status_histories.updated_at', // Include updated_at in the select query
            )
            ->get();

        // Định dạng dữ liệu trả về
        $formatted = $history->map(function ($item) {
            return [
                'old_status' => $item->old_status,
                'new_status' => $item->new_status,
                'changed_by' => $item->changed_by,
                'changed_by_name' => $item->changed_by_name, // Tên người thay đổi
                'changed_at' => $item->created_at ? date('d/m/Y H:i:s', strtotime($item->created_at)) : null,
                // Include updated_at in the formatted response
                'updated_at' => $item->updated_at ? date('d/m/Y H:i:s', strtotime($item->updated_at)) : null,
            ];
        });

        return response()->json([
            'status' => true,
            'history' => $formatted
        ]);
    }

    // Lấy tất cả lịch sử thay đổi trạng thái của mọi đơn hàng (admin)
    public function getAllOrderStatusHistories()
    {
        $history = DB::table('order_status_histories')
            ->leftJoin('users', 'order_status_histories.changed_by', '=', 'users.user_id')
            ->orderBy('order_status_histories.order_id')
            ->orderBy('order_status_histories.created_at', 'asc')
            ->select(
                'order_status_histories.order_id',
                'order_status_histories.old_status',
                'order_status_histories.new_status',
                'order_status_histories.changed_by',
                'users.full_name as changed_by_name',
                'order_status_histories.created_at'
            )
            ->get();

        $formatted = $history->map(function ($item) {
            return [
                'order_id' => $item->order_id,
                'old_status' => $item->old_status,
                'new_status' => $item->new_status,
                'changed_by' => $item->changed_by,
                'changed_by_name' => $item->changed_by_name,
                'changed_at' => $item->created_at ? date('d/m/Y H:i:s', strtotime($item->created_at)) : null,
            ];
        });

        return response()->json([
            'status' => true,
            'history' => $formatted
        ]);
    }


    // Danh sách tất cả yêu cầu hoàn hàng (admin)
    public function getReturnRequestList(Request $request)
    {
        $status = $request->input('status'); // Lọc theo trạng thái nếu có
        $query = DB::table('return_requests')
            ->leftJoin('orders', 'return_requests.order_id', '=', 'orders.order_id')
            ->leftJoin('users', 'return_requests.user_id', '=', 'users.user_id')
            ->select(
                'return_requests.return_id',
                'return_requests.order_id',
                'orders.order_code',
                'orders.customer',
                'users.email',
                'return_requests.user_id',
                'users.full_name as user_name',
                'return_requests.reason',
                'return_requests.status',
                'return_requests.refund_amount',
                'return_requests.return_items',
                'return_requests.created_at',
                'return_requests.updated_at'
            );
        if ($status) {
            $query->where('return_requests.status', $status);
        }
        $results = $query->orderByDesc('return_requests.created_at')->get();

        $formatted = $results->map(function ($row) {
            return [
                'return_id' => $row->return_id,
                'order_id' => $row->order_id,
                'order_code' => $row->order_code,
                'customer' => $row->customer,
                'user_id' => $row->user_id,
                'user_name' => $row->user_name,
                'email' => $row->email,
                'reason' => $row->reason,
                'status' => $row->status,
                'refund_amount' => number_format($row->refund_amount, 0, '.', ''),
                'return_items' => json_decode($row->return_items, true), // Giả sử return_items là JSON
                'created_at' => $row->created_at ? date('d/m/Y H:i:s', strtotime($row->created_at)) : null,
                'updated_at' => $row->updated_at ? date('d/m/Y H:i:s', strtotime($row->updated_at)) : null,
            ];
        });

        return response()->json([
            'status' => true,
            'return_requests' => $formatted
        ]);
    }
    // Admin hủy đơn hàng
    public function adminCancelOrder(Request $request, $id)
    {
        $order = Orders::find($id);
        if (!$order) {
            return response()->json([
                'status' => false,
                'message' => 'Không tìm thấy đơn hàng'
            ], 404);
        }

        // Không cho hủy nếu đơn hàng đã hoàn thành hoặc đã hủy
        if (in_array($order->status, ['Hoàn thành', 'Đã hủy'])) {
            return response()->json([
                'status' => false,
                'message' => 'Không thể hủy đơn hàng đã hoàn thành hoặc đã hủy'
            ], 400);
        }

        $request->validate([
            'cancel_reason' => 'required|string|max:255'
        ]);

        $oldStatus = $order->status;

        $order->status = 'Đã hủy';
        $order->cancel_reason = $request->cancel_reason;
        $order->save();

        // Nếu đã trả bằng ví thì hoàn tiền lại vào ví
        if ($order->paid_by_wallet > 0) {
            $wallet = Wallet::firstOrCreate(
                ['user_id' => $order->user_id],
                ['balance' => 0.00]
            );
            $wallet->balance += $order->paid_by_wallet;
            $wallet->save();

            WalletTransaction::create([
                'wallet_id' => $wallet->wallet_id,
                'type' => 'hoàn tiền',
                'amount' => $order->paid_by_wallet,
                'note' => 'Hoàn tiền do hủy đơn hàng #' . $order->order_code
            ]);
        }
        // Broadcast event for realtime update
        event(new OrderUpdated($order, $order->user_id));

        // Gửi email thông báo nếu có email
        if ($order->user && $order->user->email) {
            try {
                Mail::to($order->user->email)->send(new OrderCancelledByAdminMail($order, $request->cancel_reason));
            } catch (\Exception $e) {
                // Bạn có thể log lỗi nếu muốn: Log::error($e->getMessage());
            }
        }


        // Lưu vào bảng lịch sử trạng thái (nếu có)
        OrderStatusHistory::create([
            'order_id' => $order->order_id,
            'old_status' => $oldStatus,
            'new_status' => 'Đã hủy',
            'changed_by' => $request->user() ? $request->user()->user_id : null,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Đơn hàng đã được admin hủy thành công',
            'order' => $order
        ]);
    }

    // luồng xử lý đơn hàng hoàn thành thì được cộng điểm 
    public function markAsCompleted($orderId)
    {
        $order = Orders::find($orderId);
        if (!$order) return response()->json(['message' => 'Không tìm thấy đơn hàng'], 404);

        $alreadyRewarded = LoyaltyPoint::where('user_id', $order->user_id)
            ->where('type', 'order')
            ->where('description', 'like', '%#' . $order->order_code . '%')
            ->exists();

        if ($order->status === 'Hoàn thành' && $alreadyRewarded) {
            return response()->json(['message' => 'Đơn hàng đã hoàn thành và đã được cộng điểm trước đó'], 400);
        }

        $points = 0;
        try {
            DB::transaction(function () use ($order, $alreadyRewarded, &$points) {
                if ($order->status !== 'Hoàn thành') $order->update(['status' => 'Hoàn thành']);

                $points = ceil(ceil($order->total_amount / 100) / 1000) * 1000;
                if (!$alreadyRewarded && $points > 0) {
                    LoyaltyPoint::create([
                        'user_id' => $order->user_id,
                        'points' => $points,
                        'type' => 'order',
                        'description' => 'Tích điểm từ đơn hàng #' . $order->order_code,
                        'expired_at' => now()->addMonth(), // Điểm hết hạn sau 1 tháng
                    ]);
                }

                $this->updateUserLoyalty($order->user_id);
            });

            return response()->json([
                'message' => 'Đã hoàn thành đơn hàng và cộng điểm (có hạn sử dụng)',
                'earned_points' => $points,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Lỗi trong quá trình hoàn tất đơn hàng',
                'error' => $e->getMessage(),
            ], 500);
        }
    }



    protected function updateUserLoyalty($userId)
    {
        $totalPoints = LoyaltyPoint::where('user_id', $userId)
            ->where(function ($q) {
                $q->whereNull('expired_at')->orWhere('expired_at', '>', now());
            })
            ->sum('points');
        $user = User::where('user_id', $userId)->first();

        if ($user) {
            $tier = LoyaltyTier::where('min_points', '<=', $totalPoints)
                ->orderByDesc('min_points')
                ->first();

            $user->loyalty_points = $totalPoints;
            $user->tier_id = $tier ? $tier->tier_id : null;
            $user->save();
        }
    }
}
