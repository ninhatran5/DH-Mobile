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
use Illuminate\Support\Facades\Log;
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
        $orders = Orders::with(['paymentMethods', 'orderItems'])
            ->orderByDesc('created_at')
            ->where('user_id', $user->user_id)
            ->get();

        $formattedOrders = $orders->filter(function ($order) {
            // Ẩn đơn gốc đã hoàn trả hết (total_amount = 0) nếu muốn
            // Uncomment dòng dưới để ẩn:
            // return !($order->total_amount == 0 && !$order->is_return_order);
            return true; // Hiện tại vẫn hiển thị tất cả
        })->map(function ($order) {
            // Kiểm tra xem có phải đơn hoàn trả 100% không
            $isFullReturnOrder = $order->is_return_order && in_array($order->status, ['Yêu cầu hoàn hàng', 'Đã chấp thuận', 'Đang xử lý', 'Đã trả hàng']);

            if ($isFullReturnOrder) {
                // Trường hợp hoàn trả 100%: Sản phẩm đã có giá sau giảm giá trong order_items
                $adjustedTotalAmount = $order->orderItems->sum(function ($item) {
                    return $item->price * $item->quantity;
                });
            } else {
                // Trường hợp đơn hàng bình thường: mặc định là total_amount trong DB
                $adjustedTotalAmount = $order->total_amount;

                // Chỉ tính lại nếu có sản phẩm đã được hoàn trả một phần
                $returnRequests = DB::table('return_requests')
                    ->where('order_id', $order->order_id)
                    ->where('status', '!=', 'Đã từ chối')
                    ->get();

                if (!empty($returnRequests)) {
                    // Tỷ lệ giảm giá toàn đơn
                    $totalOriginalAmount = $order->orderItems->sum(function ($it) {
                        return $it->price * $it->quantity;
                    });
                    $totalDiscountAmount = ($order->voucher_discount ?? 0) + ($order->rank_discount ?? 0);
                    $discountRate = $totalOriginalAmount > 0 ? $totalDiscountAmount / $totalOriginalAmount : 0;

                    // Thu thập tất cả sản phẩm đã trả và số lượng từ return_requests
                    $returnedQuantities = [];
                    foreach ($returnRequests as $returnRequest) {
                        if ($returnRequest->return_items) {
                            $items = json_decode($returnRequest->return_items, true);
                            if (is_array($items)) {
                                foreach ($items as $it) {
                                    $variantId = $it['variant_id'] ?? null;
                                    $key = $it['product_id'] . '-' . $variantId;
                                    $returnedQuantities[$key] = ($returnedQuantities[$key] ?? 0) + $it['quantity'];
                                }
                            }
                        }
                    }

                    // Tính tổng tiền sau giảm cho phần sản phẩm còn lại
                    $adjustedTotalAmount = 0;
                    foreach ($order->orderItems as $it) {
                        $variantId = $it->variant_id ?? null;
                        $key = $it->product_id . '-' . $variantId;
                        $remainingQty = $it->quantity - ($returnedQuantities[$key] ?? 0);
                        if ($remainingQty > 0) {
                            $priceAfterDiscount = $it->price * (1 - $discountRate);
                            $adjustedTotalAmount += $priceAfterDiscount * $remainingQty;
                        }
                    }
                }
            }
            return [
                'order_id' => $order->order_id,
                'order_code' => $order->order_code,
                'customer' => $order->customer,
                'email' => $order->email,
                'total_amount' => number_format($adjustedTotalAmount, 0, ".", ""),
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

        // Kiểm tra xem đây có phải là đơn hoàn trả 100% không
        $isFullReturnOrder = $order->is_return_order && in_array($order->status, ['Yêu cầu hoàn hàng', 'Đã chấp thuận', 'Đang xử lý', 'Đã trả hàng']);

        if ($isFullReturnOrder) {
            // Trường hợp hoàn trả 100%: đơn gốc đã trở thành đơn hoàn trả
            // Gộp các sản phẩm trùng lặp theo product_id và variant_id
            $groupedItems = [];
            foreach ($order->orderItems as $item) {
                $key = $item->product_id . '-' . $item->variant_id;
                if (!isset($groupedItems[$key])) {
                    $groupedItems[$key] = $item;
                    $groupedItems[$key]->total_quantity = $item->quantity;
                } else {
                    $groupedItems[$key]->total_quantity += $item->quantity;
                }
            }

            $orderItems = collect($groupedItems)->map(function ($item) {
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
                    'quantity' => $item->total_quantity,
                    'price' => number_format($item->price, 0, ".", ""),
                    'subtotal' => number_format($item->price * $item->total_quantity, 0, ".", ""),
                    'variant_attributes' => $variantAttributes,
                    'return_status' => 'Đã yêu cầu hoàn trả toàn bộ'
                ];
            })->values(); // Thêm values() để reset keys và trả về array

            // Tính tổng tiền dựa trên các sản phẩm thực tế được hoàn trả
            $calculatedTotalAmount = collect($groupedItems)->sum(function ($item) {
                return $item->price * $item->total_quantity;
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
                'total_amount' => number_format($calculatedTotalAmount, 0, ".", ""),
                'products' => $orderItems,
                'updated_at' => $order->updated_at,
                'is_full_return_order' => true
            ];

            return response()->json([
                'status' => true,
                'order' => $formattedOrder
            ]);
        }

        // Trường hợp bình thường hoặc hoàn trả một phần
        // Lấy thông tin các sản phẩm đã được trả (nếu có)
        $returnRequests = DB::table('return_requests')
            ->where('order_id', $id)
            ->where('status', '!=', 'Đã từ chối')
            ->get();

        // Thu thập tất cả sản phẩm đã trả và số lượng từ return_requests
        $returnedQuantities = [];
        foreach ($returnRequests as $returnRequest) {
            if ($returnRequest->return_items) {
                $items = json_decode($returnRequest->return_items, true);
                if (is_array($items)) {
                    foreach ($items as $item) {
                        // Kiểm tra xem có variant_id không, nếu không thì dùng null
                        $variantId = $item['variant_id'] ?? null;
                        $key = $item['product_id'] . '-' . $variantId;
                        $returnedQuantities[$key] = ($returnedQuantities[$key] ?? 0) + $item['quantity'];
                    }
                }
            }
        }

        // Kiểm tra và lấy đơn hoàn trả riêng (nếu có) - chỉ để hiển thị thông tin
        $returnOrder = null;
        $returnOrderFromDB = null;

        // Tìm đơn hoàn trả trong bảng orders (cho trường hợp hoàn trả một phần)
        if (!empty($returnRequests)) {
            $firstReturnRequest = $returnRequests->first();
            if ($firstReturnRequest && isset($firstReturnRequest->return_id)) {
                $returnRequestId = $firstReturnRequest->return_id;
                $returnOrderFromDB = Orders::with(['orderItems.product', 'orderItems.variant.variantAttributeValues.value.attribute'])
                    ->where('return_request_id', $returnRequestId)
                    ->where('is_return_order', true)
                    ->first();
            }
        }

        // Tính tỷ lệ giảm giá toàn đơn để hiển thị giá sau chiết khấu cho phần còn lại
        $totalOriginalAmountDisplay = $order->orderItems->sum(function ($it) {
            return $it->price * $it->quantity;
        });
        $totalDiscountAmountDisplay = ($order->voucher_discount ?? 0) + ($order->rank_discount ?? 0);
        $discountRateDisplay = $totalOriginalAmountDisplay > 0 ? $totalDiscountAmountDisplay / $totalOriginalAmountDisplay : 0;

        // Định dạng chi tiết sản phẩm còn lại (trừ đi số lượng đã trả) với giá sau chiết khấu
        $orderItems = $order->orderItems->map(function ($item) use ($returnedQuantities, $discountRateDisplay) {
            $variantAttributes = [];
            if ($item->variant) {
                $variantAttributes = $item->variant->variantAttributeValues->map(function ($attrValue) {
                    return [
                        'attribute_name' => $attrValue->value->attribute->name,
                        'attribute_value' => $attrValue->value->value
                    ];
                });
            }

            // Sử dụng cùng logic tạo key như khi thu thập returnedQuantities
            $variantId = $item->variant_id ?? null;
            $key = $item->product_id . '-' . $variantId;

            // Sử dụng số liệu từ return_requests làm nguồn chính xác
            // vì đây là nơi lưu trữ thông tin chi tiết về sản phẩm được hoàn trả
            $totalReturnedQty = $returnedQuantities[$key] ?? 0;

            $remainingQty = $item->quantity - $totalReturnedQty;

            // Chỉ trả về nếu còn số lượng (sản phẩm chưa được hoàn trả hết)
            if ($remainingQty > 0) {
                $priceAfterDiscount = $item->price * (1 - $discountRateDisplay);
                $subtotalAfterDiscount = $priceAfterDiscount * $remainingQty;
                return [
                    'variant_id' => $item->variant_id,
                    'product_id' => $item->product_id,
                    'product_name' => $item->product->name,
                    'product_image' => $item->variant ? $item->variant->image_url : $item->product->image_url,
                    'quantity' => $remainingQty,
                    'price' => number_format($priceAfterDiscount, 0, ".", ""),
                    'subtotal' => number_format($subtotalAfterDiscount, 0, ".", ""),
                    'variant_attributes' => $variantAttributes
                ];
            }
            return null;
        })->filter()->values(); // Loại bỏ null và reset keys

        // Tính lại tổng tiền của đơn hàng gốc sau khi trừ đi sản phẩm đã hoàn trả
        // Nếu có hoàn trả -> cộng tổng các subtotal sau chiết khấu; nếu không -> lấy từ DB
        if (!empty($returnRequests)) {
            $adjustedTotalAmount = collect($orderItems)->sum(function ($it) {
                return (int) $it['subtotal'];
            });
        } else {
            // Không có hoàn trả -> lấy total_amount từ database
            $adjustedTotalAmount = $order->total_amount;
        }

        if ($returnOrderFromDB) {
            // Có đơn hoàn trả riêng trong database
            $returnOrderItems = $returnOrderFromDB->orderItems->map(function ($item) {
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
                    'variant_attributes' => $variantAttributes,
                    'return_status' => 'Đã yêu cầu hoàn trả'
                ];
            });

            $returnOrder = [
                'order_id' => $returnOrderFromDB->order_id,
                'order_code' => $returnOrderFromDB->order_code,
                'order_date' => $returnOrderFromDB->created_at,
                'customer' => $returnOrderFromDB->customer,
                'email' => $returnOrderFromDB->email,
                'phone' => $returnOrderFromDB->phone,
                'address' => $returnOrderFromDB->address . ', ' .
                    $returnOrderFromDB->ward . ', ' .
                    $returnOrderFromDB->district . ', ' .
                    $returnOrderFromDB->city,
                'payment_method' => [
                    $order->paymentMethods->name,
                    $order->paymentMethods->description
                ],
                'payment_status' => $returnOrderFromDB->payment_status,
                'status' => $returnOrderFromDB->status,
                'cancel_reason' => null,
                'voucher' => null,
                'voucher_discount' => "0",
                'rank_discount' => "0",
                'total_amount' => number_format($returnOrderFromDB->total_amount, 0, ".", ""),
                'products' => $returnOrderItems,
                'updated_at' => $returnOrderFromDB->updated_at,
                'is_return_order' => true
            ];
        }

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
            'total_amount' => number_format($adjustedTotalAmount, 0, ".", ""),
            'products' => $orderItems, // Chỉ còn sản phẩm chưa hoàn trả
            'updated_at' => $order->updated_at,
        ];

        // Thêm đơn hoàn trả vào response nếu có
        if ($returnOrder) {
            $formattedOrder['return_order'] = $returnOrder;
        }

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

        // Validate request
        $request->validate([
            'return_reason' => 'required|string',
            'return_reason_other' => 'nullable|string|max:255',
            'upload_url' => 'nullable|array|max:3',
            'upload_url.*' => 'file|mimes:jpg,png,jpeg|max:4096',
            'return_items' => 'required',
            'return_items.*.product_id' => 'required|integer',
            'return_items.*.quantity' => 'required|integer|min:1',
        ]);

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

        // Kiểm tra lý do có hợp lệ không
        if (!in_array($reason, $reasons)) {
            return response()->json([
                'status' => false,
                'message' => 'Lý do hoàn hàng không hợp lệ.'
            ], 400);
        }

        // Nếu chọn "Lý do khác" thì bắt buộc nhập chi tiết
        if ($reason === 'Lý do khác' && empty($request->return_reason_other)) {
            return response()->json([
                'status' => false,
                'message' => 'Vui lòng nhập lý do hoàn hàng cụ thể.'
            ], 400);
        }

        // Xử lý return_items - có thể là array hoặc JSON string
        $returnItems = $request->return_items;

        // Nếu return_items là string (JSON), decode nó
        if (is_string($returnItems)) {
            $returnItems = json_decode($returnItems, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                return response()->json([
                    'status' => false,
                    'message' => 'return_items must be a valid JSON array or array format. JSON error: ' . json_last_error_msg()
                ], 400);
            }
        }

        // Kiểm tra xem $returnItems có phải là array không
        if (!is_array($returnItems)) {
            return response()->json([
                'status' => false,
                'message' => 'return_items must be an array'
            ], 400);
        }

        // Kiểm tra xem array có rỗng không
        if (empty($returnItems)) {
            return response()->json([
                'status' => false,
                'message' => 'return_items cannot be empty'
            ], 400);
        }

        // Validate từng item trong return_items
        foreach ($returnItems as $index => $item) {
            if (!isset($item['product_id']) || !is_numeric($item['product_id'])) {
                return response()->json([
                    'status' => false,
                    'message' => "return_items[{$index}].product_id is required and must be a number"
                ], 400);
            }

            if (!isset($item['quantity']) || !is_numeric($item['quantity']) || $item['quantity'] < 1) {
                return response()->json([
                    'status' => false,
                    'message' => "return_items[{$index}].quantity is required and must be a number greater than 0"
                ], 400);
            }
        }

        // Kiểm tra sản phẩm trong đơn và tính số tiền refund
        $orderItems = $order->orderItems->keyBy('product_id');
        
        // ✅ Tính tỷ lệ giảm giá của đơn hàng
        $totalOriginalAmount = $order->orderItems->sum(function ($item) {
            return $item->price * $item->quantity;
        });
        $totalDiscountAmount = ($order->voucher_discount ?? 0) + ($order->rank_discount ?? 0);
        $discountRate = $totalOriginalAmount > 0 ? $totalDiscountAmount / $totalOriginalAmount : 0;

        $refundAmount = 0;
        $refundBreakdown = [];

        foreach ($returnItems as $item) {
            $productId = $item['product_id'];

            if (!isset($orderItems[$productId])) {
                return response()->json([
                    'status' => false,
                    'message' => 'Sản phẩm không tồn tại trong đơn hàng.'
                ], 400);
            }

            $orderItem = $orderItems[$productId];
            $alreadyReturnedQty = $alreadyReturnedQuantities[$productId] ?? 0;
            $availableQty = $orderItem->quantity - $alreadyReturnedQty;

            if ($availableQty <= 0) {
                return response()->json([
                    'status' => false,
                    'message' => "Sản phẩm '{$orderItem->product->name}' đã được hoàn trả hết rồi."
                ], 400);
            }

            if ($item['quantity'] > $availableQty) {
                return response()->json([
                    'status' => false,
                    'message' => "Sản phẩm '{$orderItem->product->name}' chỉ còn {$availableQty} sản phẩm có thể hoàn trả, bạn đã yêu cầu hoàn {$alreadyReturnedQty} sản phẩm trước đó."
                ], 400);
            }

            // ✅ Tính tiền hoàn cho từng sản phẩm - có tính tỷ lệ giảm giá
            $originalItemAmount = $orderItem->price * $item['quantity'];
            $itemRefundAmount = $originalItemAmount * (1 - $discountRate);
            $refundAmount += $itemRefundAmount;

            // Debug: lưu chi tiết từng sản phẩm
            $refundBreakdown[] = [
                'product_id' => $productId,
                'product_name' => $orderItem->product->name ?? 'Unknown',
                'original_price' => $orderItem->price,
                'quantity' => $item['quantity'],
                'original_subtotal' => $originalItemAmount,
                'discount_rate' => round($discountRate * 100, 2) . '%',
                'refund_subtotal' => round($itemRefundAmount, 0)
            ];
        }

        // Kiểm tra xem còn sản phẩm nào có thể hoàn trả không
        // Lấy tất cả yêu cầu hoàn trả đã được chấp nhận (không bị từ chối)
        $existingReturnRequests = DB::table('return_requests')
            ->where('order_id', $order->order_id)
            ->where('user_id', $request->user()->user_id)
            ->where('status', '!=', 'Đã từ chối')
            ->get();

        // Tính tổng số lượng đã được yêu cầu hoàn trả
        $alreadyReturnedQuantities = [];
        foreach ($existingReturnRequests as $existingRequest) {
            if ($existingRequest->return_items) {
                $items = json_decode($existingRequest->return_items, true);
                if (is_array($items)) {
                    foreach ($items as $item) {
                        $productId = $item['product_id'];
                        $alreadyReturnedQuantities[$productId] = ($alreadyReturnedQuantities[$productId] ?? 0) + $item['quantity'];
                    }
                }
            }
        }


        // ✅ Validation cuối cùng cho refund_amount
        if ($refundAmount <= 0) {
            return response()->json([
                'status' => false,
                'message' => 'Số tiền hoàn trả phải lớn hơn 0. Vui lòng kiểm tra lại sản phẩm và số lượng.'
            ], 400);
        }

        // Kiểm tra xem refund_amount có vượt quá tổng giá trị đơn hàng không
        $maxRefundAmount = $order->orderItems->sum(function ($item) {
            return $item->price * $item->quantity;
        });

        if ($refundAmount > $maxRefundAmount) {
            Log::error("Refund amount exceeds order total", [
                'order_id' => $order->order_id,
                'order_code' => $order->order_code,
                'calculated_refund_amount' => $refundAmount,
                'max_allowed_refund_amount' => $maxRefundAmount,
                'breakdown' => $refundBreakdown
            ]);

            return response()->json([
                'status' => false,
                'message' => 'Số tiền hoàn trả vượt quá giá trị đơn hàng. Vui lòng kiểm tra lại.'
            ], 400);
        }

        DB::beginTransaction();
        try {
            // Tạo mới yêu cầu hoàn hàng với validation đã hoàn tất
            $returnId = DB::table('return_requests')->insertGetId([
                'order_id' => $order->order_id,
                'user_id' => $request->user()->user_id,
                'reason' => $reason,
                'return_reason_other' => $request->return_reason_other,
                'status' => 'đã yêu cầu',
                'refund_amount' => $refundAmount, // ✅ đã được validate kỹ lưỡng
                'upload_url' => json_encode($imageUrls),
                'return_items' => json_encode($returnItems),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Kiểm tra xem có phải hoàn trả toàn bộ sản phẩm không
            $totalOrderQuantity = $order->orderItems->sum('quantity');
            $totalReturnQuantity = array_sum(array_column($returnItems, 'quantity'));

            // Tính tổng số lượng đã được hoàn trả trước đó (từ các yêu cầu khác)
            $totalAlreadyReturnedQty = array_sum($alreadyReturnedQuantities);
            $totalAfterThisReturn = $totalAlreadyReturnedQty + $totalReturnQuantity;

            $returnOrderId = null;
            $returnOrderCode = null;

            if ($totalAfterThisReturn >= $totalOrderQuantity) {

                // ✅ Kiểm tra xem có phải hoàn trả 100% ngay từ đầu hay có hoàn trả từng phần trước đó
                $hasPartialReturns = !empty($alreadyReturnedQuantities);
                
                if ($hasPartialReturns) {
                    // 🔄 Trường hợp có hoàn trả từng phần trước đó → Cập nhật đơn gốc với đúng từng sản phẩm
                    
                    // ✨ Tính toán chính xác cho từng sản phẩm riêng biệt
                    $adjustedTotalForRemainingPart = 0;
                    $itemsToUpdateInOriginalOrder = [];
                    $totalRemainingQuantity = 0;
                    
                    foreach ($returnItems as $returnItem) {
                        $productId = $returnItem['product_id'];
                        $variantId = $returnItem['variant_id'] ?? null;
                        $quantityToReturn = $returnItem['quantity'];
                        
                        // Tìm sản phẩm tương ứng trong đơn gốc
                        $matchingOrderItem = null;
                        foreach ($order->orderItems as $orderItem) {
                            if (
                                $orderItem->product_id == $productId &&
                                $orderItem->variant_id == $variantId
                            ) {
                                $matchingOrderItem = $orderItem;
                                break;
                            }
                        }
                        
                        if ($matchingOrderItem) {
                            // Tính giá sau chiết khấu cho sản phẩm này
                            $priceAfterDiscountForThisItem = $matchingOrderItem->price * (1 - $discountRate);
                            
                            // Tính tổng tiền cho sản phẩm này
                            $subtotalForThisItem = $priceAfterDiscountForThisItem * $quantityToReturn;
                            $adjustedTotalForRemainingPart += $subtotalForThisItem;
                            $totalRemainingQuantity += $quantityToReturn;
                            
                            // Lưu thông tin để cập nhật sau
                            $itemsToUpdateInOriginalOrder[] = [
                                'product_id' => $productId,
                                'variant_id' => $variantId,
                                'quantity' => $quantityToReturn,
                                'price' => $priceAfterDiscountForThisItem,
                                'subtotal' => $subtotalForThisItem
                            ];
                        }
                    }
                    
                    // ✨ Cập nhật đơn gốc với tổng tiền chính xác
                    DB::table('orders')->where('order_id', $order->order_id)->update([
                        'status' => 'Yêu cầu hoàn hàng',
                        'return_request_id' => $returnId,
                        'is_return_order' => true,
                        'total_amount' => $adjustedTotalForRemainingPart, // Tổng chính xác của tất cả sản phẩm
                        'updated_at' => now(),
                    ]);
                    
                    // ✨ Xóa tất cả order_items cũ trong đơn gốc
                    DB::table('order_items')->where('order_id', $order->order_id)->delete();
                    
                    // ✨ Tạo lại order_items mới cho đơn gốc với thông tin đúng
                    foreach ($itemsToUpdateInOriginalOrder as $itemData) {
                        DB::table('order_items')->insert([
                            'order_id' => $order->order_id,
                            'product_id' => $itemData['product_id'],
                            'variant_id' => $itemData['variant_id'],
                            'quantity' => $itemData['quantity'],
                            'price' => $itemData['price'],
                            'created_at' => now(),
                            'updated_at' => now()
                        ]);
                    }
                    
                    $returnOrderCode = $order->order_code;
                    $message = "Hoàn trả toàn bộ - đơn gốc còn lại {$totalRemainingQuantity} sản phẩm";
                    
                    // 📝 Log thông tin chi tiết để debug
                    Log::info('Multi-product partial return completed - Updated original order', [
                        'order_id' => $order->order_id,
                        'total_remaining_quantity' => $totalRemainingQuantity,
                        'adjusted_total' => $adjustedTotalForRemainingPart,
                        'items_breakdown' => $itemsToUpdateInOriginalOrder,
                        'discount_rate' => $discountRate,
                        'original_return_items' => $returnItems
                    ]);
                } else {
                    // ✅ Trường hợp hoàn trả 100% ngay từ đầu: Cập nhật đơn gốc với giá trị đúng sau chiết khấu
                    $totalOriginalForFullReturn = $order->orderItems->sum(function ($item) {
                        return $item->price * $item->quantity;
                    });
                    $adjustedTotalForFullReturn = $totalOriginalForFullReturn * (1 - $discountRate);
                    
                    DB::table('orders')->where('order_id', $order->order_id)->update([
                        'status' => 'Yêu cầu hoàn hàng',
                        'return_request_id' => $returnId,
                        'is_return_order' => true,
                        'total_amount' => $adjustedTotalForFullReturn, // ✅ Cập nhật giá trị sau chiết khấu
                        'updated_at' => now(),
                    ]);
                    
                    // ✅ Cập nhật giá sản phẩm trong order_items theo tỷ lệ giảm giá
                    foreach ($order->orderItems as $orderItem) {
                        $priceAfterDiscountForItem = $orderItem->price * (1 - $discountRate);
                        DB::table('order_items')
                            ->where('order_id', $order->order_id)
                            ->where('product_id', $orderItem->product_id)
                            ->where('variant_id', $orderItem->variant_id)
                            ->update([
                                'price' => $priceAfterDiscountForItem,
                                'updated_at' => now()
                            ]);
                    }

                    $returnOrderCode = $order->order_code;
                    $message = 'Đã gửi yêu cầu hoàn hàng toàn bộ đơn hàng ngay từ đầu';
                }

                // ✅ Hoàn trả hết số lượng còn lại hoặc 100%: Chỉ chuyển trạng thái đơn gốc, KHÔNG tạo đơn mới
                DB::table('orders')->where('order_id', $order->order_id)->update([
                    'status' => 'Yêu cầu hoàn hàng',
                    'return_request_id' => $returnId,
                    'is_return_order' => true,
                    'updated_at' => now(),
                ]);

                $returnOrderCode = $order->order_code; // Sử dụng mã đơn gốc
                $message = 'Đã gửi yêu cầu hoàn hàng toàn bộ đơn hàng còn lại';

            } else {
                // ✅ Hoàn trả một phần: Đơn gốc giữ nguyên + Tạo đơn hoàn trả
                // Tạo mã đơn hoàn trả duy nhất bằng cách thêm timestamp hoặc số thứ tự
                $existingReturnOrdersCount = DB::table('orders')
                    ->where('original_order_id', $order->order_id)
                    ->where('is_return_order', true)
                    ->count();

                $returnOrderCode = 'TH' . $order->order_code . '-' . str_pad($existingReturnOrdersCount + 1, 2, '0', STR_PAD_LEFT);

                $returnOrderId = DB::table('orders')->insertGetId([
                    'user_id' => $order->user_id,
                    'order_code' => $returnOrderCode, // Mã đơn hoàn trả duy nhất
                    'customer' => $order->customer,
                    'email' => $order->email,
                    'phone' => $order->phone,
                    'address' => $order->address,
                    'ward' => $order->ward,
                    'district' => $order->district,
                    'city' => $order->city,
                    'method_id' => $order->method_id,
                    'payment_status' => 'Đã thanh toán',
                    'status' => 'Yêu cầu hoàn hàng',
                    'total_amount' => $refundAmount,
                    'voucher_discount' => 0,
                    'rank_discount' => 0,
                    'paid_by_wallet' => 0,
                    'original_order_id' => $order->order_id, // Liên kết với đơn gốc
                    'is_return_order' => true, // Đánh dấu đây là đơn hoàn trả
                    'return_request_id' => $returnId, // Liên kết với yêu cầu hoàn trả
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // Tạo order items cho đơn hoàn trả - sử dụng thông tin từ return_items
                foreach ($returnItems as $returnItem) {
                    // Tìm order item tương ứng dựa trên cả product_id và variant_id
                    $matchingOrderItem = null;
                    foreach ($order->orderItems as $orderItem) {
                        if (
                            $orderItem->product_id == $returnItem['product_id'] &&
                            $orderItem->variant_id == ($returnItem['variant_id'] ?? null)
                        ) {
                            $matchingOrderItem = $orderItem;
                            break;
                        }
                    }

                    if (!$matchingOrderItem) {
                        throw new \Exception("Không tìm thấy order item tương ứng cho product_id: {$returnItem['product_id']}, variant_id: {$returnItem['variant_id']}");
                    }

                    // ✅ Tính giá sau khi trừ giảm giá cho sản phẩm hoàn trả
                    $priceAfterDiscount = $matchingOrderItem->price * (1 - $discountRate);
                    
                    DB::table('order_items')->insert([
                        'order_id' => $returnOrderId,
                        'product_id' => $returnItem['product_id'],
                        'variant_id' => $returnItem['variant_id'] ?? null, // Sử dụng variant_id từ return_items
                        'quantity' => $returnItem['quantity'],
                        'price' => $priceAfterDiscount,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }

                // Cập nhật return_request với order_id của đơn hoàn trả
                DB::table('return_requests')->where('return_id', $returnId)->update([
                    'return_order_id' => $returnOrderId,
                    'updated_at' => now(),
                ]);

                // $returnOrderCode đã được tạo ở trên với số thứ tự
                $message = 'Đã gửi yêu cầu hoàn hàng một phần và tạo đơn hoàn trả';
            }

            DB::commit();

            // Broadcast event realtime
            $order = Orders::find($order->order_id);
            event(new OrderUpdated($order, $order->user_id));


            // 🔔 Thông báo cho admin
            // DB::table('admin_notifications')->insert([
            //     'title' => 'Yêu cầu hoàn hàng mới',
            //     'message' => "Khách hàng {$order->customer} vừa gửi yêu cầu hoàn hàng cho đơn #{$order->order_code}",
            //     'order_id' => $order->order_id,
            //     'return_request_id' => $returnId,
            //     'created_at' => now(),
            //     'updated_at' => now(),
            // ]);


            $response = [
                'status' => true,
                'message' => $message,
                'return_request_id' => $returnId,
                'return_order_code' => $returnOrderCode,
                'is_full_return' => $totalReturnQuantity >= $totalOrderQuantity
            ];

            if ($returnOrderId) {
                $response['return_order_id'] = $returnOrderId;
            }

            return response()->json($response);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => 'Có lỗi xảy ra khi tạo yêu cầu hoàn hàng: ' . $e->getMessage()
            ], 500);
        }
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

        // ✅ Lấy yêu cầu hoàn hàng theo return_id
        $returnRequest = ReturnRequest::find($id);

        if (!$returnRequest) {
            return response()->json([
                'status' => false,
                'message' => 'Không tìm thấy yêu cầu hoàn hàng với return_id này'
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

            // 2. Cập nhật trạng thái đơn gốc (orders) ở mức tổng quát
            $order = Orders::find($returnRequest->order_id);
            if ($order) {
                if ($newStatus === 'Đã yêu cầu') {
                    $order->status = 'Đang chờ hoàn hàng';
                } elseif ($newStatus === 'Đã hoàn lại') {
                    $order->status = 'Đã trả hàng';
                    $order->payment_status = 'Đã hoàn tiền';

                    // 3. Hoàn tiền vào ví
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
                } elseif ($newStatus === 'Đã từ chối') {
                    $order->status = 'Từ chối hoàn hàng';
                }
                $order->save();
            }

            // ✅ Gọi sự kiện realtime theo return_id
            event(new ReturnRequestUpdated($returnRequest->return_id, [
                'status' => $returnRequest->status,
                'payment_status' => $order ? $order->payment_status : null,
                'refund_amount' => $newStatus === 'Đã hoàn lại' ? $refundAmount : 0,
                'updated_at' => now(),
            ]));

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

        // Lấy tất cả variant_id từ tất cả các yêu cầu hoàn trả
        $allVariantIds = [];
        $returnRequests->each(function ($r) use (&$allVariantIds) {
            if ($r->return_items) {
                $items = json_decode($r->return_items, true);
                if (is_array($items)) {
                    foreach ($items as $item) {
                        if (isset($item['variant_id'])) {
                            $allVariantIds[] = $item['variant_id'];
                        }
                    }
                }
            }
        });

        // Lấy thông tin chi tiết của tất cả các variant cần thiết trong 1 query
        $variantDetails = collect();
        $variantAttributes = collect();
        if (!empty($allVariantIds)) {
            $variantDetails = DB::table('product_variants')
                ->join('products', 'product_variants.product_id', '=', 'products.product_id')
                ->whereIn('product_variants.variant_id', array_unique($allVariantIds))
                ->select(
                    'products.name as product_name',
                    'products.image_url as product_image',
                    'product_variants.variant_id',
                    'product_variants.price',
                    'products.product_id'
                )
                ->get()
                ->keyBy('variant_id'); // Dùng variant_id làm key để tra cứu nhanh

            // Lấy thông tin thuộc tính của các variant
            $variantAttributes = DB::table('variant_attribute_values')
                ->join('attribute_values', 'variant_attribute_values.value_id', '=', 'attribute_values.value_id')
                ->join('attributes', 'attribute_values.attribute_id', '=', 'attributes.attribute_id')
                ->whereIn('variant_attribute_values.variant_id', array_unique($allVariantIds))
                ->select(
                    'variant_attribute_values.variant_id',
                    'attributes.name as attribute_name',
                    'attribute_values.value as attribute_value'
                )
                ->get()
                ->groupBy('variant_id'); // Group theo variant_id
        }

        //Format danh sách yêu cầu hoàn trả - sử dụng subtotal từ returned_items
        $returnRequestsFormatted = $returnRequests->map(function ($r) use ($variantDetails, $variantAttributes) {
            // Xử lý thông tin chi tiết các sản phẩm được hoàn trả
            $returnedItemsInfo = [];
            $totalRefundFromItems = 0; // Tổng từ subtotal của returned items

            if ($r->return_items) {
                $items = json_decode($r->return_items, true);
                if (is_array($items)) {
                    foreach ($items as $item) {
                        $variantId = $item['variant_id'] ?? null;
                        if ($variantId && isset($variantDetails[$variantId])) {
                            $detail = $variantDetails[$variantId];

                            // Lấy thông tin thuộc tính của variant này
                            $variantAttrs = isset($variantAttributes[$variantId])
                                ? $variantAttributes[$variantId]->map(function ($attr) {
                                    return [
                                        'attribute_name' => $attr->attribute_name,
                                        'attribute_value' => $attr->attribute_value
                                    ];
                                })->toArray()
                                : [];

                            $price = $detail->price;
                            $quantity = $item['quantity'];
                            $subtotal = $price * $quantity;

                            $returnedItemsInfo[] = [
                                'product_id' => $detail->product_id,
                                'variant_id' => $variantId,
                                'quantity' => $quantity,
                                'product_name' => $detail->product_name,
                                'product_image' => $detail->product_image,
                                'price' => number_format($price, 0, '.', ''),
                                'subtotal' => number_format($subtotal, 0, '.', ''),
                                'variant_attributes' => $variantAttrs
                            ];

                            // Cộng subtotal vào tổng refund amount
                            $totalRefundFromItems += $subtotal;
                        }
                    }
                }
            }

            // Sử dụng tổng subtotal làm refund_amount chính thức
            $finalRefundAmount = $totalRefundFromItems;
            $storedRefundAmount = $r->refund_amount;

            // Cập nhật refund_amount trong database nếu khác với tổng subtotal
            if (abs($storedRefundAmount - $finalRefundAmount) > 1) {


                try {
                    DB::table('return_requests')
                        ->where('return_id', $r->return_id)
                        ->update([
                            'refund_amount' => $finalRefundAmount,
                            'updated_at' => now()
                        ]);
                } catch (\Exception $e) {
                    Log::error("Failed to update refund_amount", [
                        'return_id' => $r->return_id,
                        'error' => $e->getMessage()
                    ]);
                }
            }

            return [
                'return_id' => $r->return_id,
                'reason' => $r->reason,
                'return_reason_other' => $r->return_reason_other,
                'status' => $r->status,
                'upload_url' => $r->upload_url,
                'refund_amount' => number_format($finalRefundAmount, 0, '.', ''), // Sử dụng finalRefundAmount
                'created_at' => $r->created_at
                    ? date('d/m/Y H:i:s', strtotime($r->created_at))
                    : null,
                'returned_items' => $returnedItemsInfo
            ];
        });

        //Định dạng dữ liệu trả về
        $formattedOrder = [
            'order_id' => $order->order_id,
            'order_code' => $order->order_code,
            'customer' => $order->customer ?? optional($order->user)->name,
            'email' => optional($order->user)->email,
            // 'total_amount' => $order->total_amount !== null
            //     ? number_format($order->total_amount, 0, '.', '')
            //     : null,
            'order_status' => $order->status,
            'payment_status' => $order->payment_status,
            'payment_method_name' => optional($order->paymentMethods)->name . ' - ' . optional($order->paymentMethods)->description,
            // 'cancel_reason' => $order->cancel_reason,
            'order_created_at' => $order->created_at
                ? $order->created_at->format('d/m/Y H:i:s')
                : null,
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


    // Danh sách tất cả yêu cầu hoàn hàng (admin) - Tối ưu performance
    public function getReturnRequestList(Request $request)
    {
        $status = $request->input('status'); // Lọc theo trạng thái nếu có

        // Chỉ lấy những cột cần thiết để giảm data transfer
        // Sử dụng COALESCE để ưu tiên return_order_id trước khi fallback về order_id
        $query = DB::table('return_requests')
            ->leftJoin('orders as original_orders', 'return_requests.order_id', '=', 'original_orders.order_id')
            ->leftJoin('orders as return_orders', 'return_requests.return_order_id', '=', 'return_orders.order_id')
            ->leftJoin('users', 'return_requests.user_id', '=', 'users.user_id')
            ->select(
                'return_requests.return_id',
                'return_requests.order_id',
                'return_requests.return_order_id',
                // Ưu tiên order_code từ đơn hoàn trả (nếu có), nếu không thì lấy từ đơn gốc
                DB::raw('COALESCE(return_orders.order_code, original_orders.order_code) as order_code'),
                // Ưu tiên customer từ đơn hoàn trả (nếu có), nếu không thì lấy từ đơn gốc
                DB::raw('COALESCE(return_orders.customer, original_orders.customer) as customer'),
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

        // Optimize: Thu thập và cache variant prices một lần duy nhất
        $allVariantIds = [];
        $returnItemsCache = []; // Cache JSON decoded items

        // First pass: decode JSON và collect variant IDs
        foreach ($results as $index => $row) {
            $decodedItems = [];
            if (!empty($row->return_items)) {
                $decodedItems = json_decode($row->return_items, true);
                if (!is_array($decodedItems)) {
                    $decodedItems = [];
                }
            }

            $returnItemsCache[$index] = $decodedItems;

            // Collect variant IDs
            foreach ($decodedItems as $item) {
                $vid = $item['variant_id'] ?? null;
                if ($vid !== null) {
                    $allVariantIds[] = (int) $vid;
                }
            }
        }

        // Batch fetch variant prices một lần
        $variantPrices = [];
        if (!empty($allVariantIds)) {
            $uniqueVariantIds = array_unique($allVariantIds);
            $variantPrices = DB::table('product_variants')
                ->whereIn('variant_id', $uniqueVariantIds)
                ->pluck('price', 'variant_id')
                ->toArray();
        }

        // Batch updates cho refund amounts (nếu cần)
        $batchUpdates = [];

        $formatted = collect($results)->map(function ($row, $index) use ($variantPrices, $returnItemsCache, &$batchUpdates) {
            $storedAmount = (float) $row->refund_amount;
            $itemsSubtotal = 0;
            $decodedItems = $returnItemsCache[$index] ?? [];

            // Calculate subtotal efficiently
            foreach ($decodedItems as $item) {
                $qty = (int) ($item['quantity'] ?? 0);
                $variantId = $item['variant_id'] ?? null;
                $price = ($variantId !== null && isset($variantPrices[$variantId]))
                    ? (float) $variantPrices[$variantId]
                    : 0;
                $itemsSubtotal += $price * $qty;
            }

            // Prepare batch update nếu cần thiết
            if (abs($storedAmount - $itemsSubtotal) > 1) {
                $batchUpdates[] = [
                    'return_id' => $row->return_id,
                    'new_amount' => $itemsSubtotal,
                    'old_amount' => $storedAmount
                ];
                $storedAmount = $itemsSubtotal;
            }

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
                'refund_amount' => number_format($storedAmount, 0, '.', ''),
                'return_items' => $decodedItems,
                'created_at' => $row->created_at ? date('d/m/Y H:i:s', strtotime($row->created_at)) : null,
                'updated_at' => $row->updated_at ? date('d/m/Y H:i:s', strtotime($row->updated_at)) : null,
            ];
        });

        // Batch update refund amounts nếu có changes
        if (!empty($batchUpdates)) {
            DB::transaction(function () use ($batchUpdates) {
                foreach ($batchUpdates as $update) {
                    try {
                        DB::table('return_requests')
                            ->where('return_id', $update['return_id'])
                            ->update([
                                'refund_amount' => $update['new_amount'],
                                'updated_at' => now()
                            ]);

                        Log::info('Synced refund_amount in batch', [
                            'return_id' => $update['return_id'],
                            'old' => $update['old_amount'],
                            'new' => $update['new_amount']
                        ]);
                    } catch (\Exception $e) {
                        Log::error('Failed batch syncing refund_amount', [
                            'return_id' => $update['return_id'],
                            'error' => $e->getMessage()
                        ]);
                    }
                }
            });
        }

        return response()->json([
            'status' => true,
            'return_requests' => $formatted,
            'meta' => [
                'total_records' => $results->count(),
                'synced_records' => count($batchUpdates)
            ]
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

                    ]);
                }

                $this->updateUserLoyalty($order->user_id);
            });

            return response()->json([
                'message' => 'Đã hoàn thành đơn hàng và cộng điểm',
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
        $totalPoints = LoyaltyPoint::where('user_id', $userId)->sum('points');
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
