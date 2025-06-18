<?php

namespace App\Http\Controllers\Api;

use App\Models\Orders;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function getOrder(Request $request)
    {
        $user = $request->user();
        $orders = Orders::with(['user', 'paymentMethods'])
            ->select('order_id', 'order_code', 'user_id', 'total_amount', 'status', 'payment_status', 'method_id')
            ->where('user_id', $user->user_id)
            ->get();

        $formattedOrders = $orders->map(function ($order) {
            return [
                'order_id' => $order->order_id,
                'order_code' => $order->order_code,
                'customer' => $order->user->full_name,
                'total_amount' => number_format($order->total_amount, 0, ".", ""),
                'address' => $order->user->address . ', ' .
                    $order->user->ward . ', ' .
                    $order->user->district . ', ' .
                    $order->user->city,
                'payment_status' => $order->payment_status,
                'payment_method' => $order->paymentMethods->name,
                'status' => $order->status,

            ];
        });

        return response()->json([
            'status' => true,
            'orders' => $formattedOrders
        ]);
    }


    public function getDetailOrder(Request $request, $id)
    {
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

                // Lấy thông tin thuộc tính của biến thể
                $variantAttributes = $item->variant->variantAttributeValues->map(function ($attrValue) {
                    return [
                        'attribute_name' => $attrValue->value->attribute->name,
                        'attribute_value' => $attrValue->value->value
                    ];
                });
            }

            return [
                'product_id' => $item->product_id,
                'product_name' => $item->product->name,
                'product_image' => $item->variant ? $item->variant->image_url : $item->product->image_url,
                'quantity' => $item->quantity,
                'price' => number_format($item->price, 0, ".", ""),
                'subtotal' => number_format($item->price * $item->quantity, 0, ".", ""),
                'variant_attributes' => $variantAttributes
            ];
        });

        // Định dạng chi tiết đơn hàng
        $formattedOrder = [
            'order_id' => $order->order_id,
            'order_code' => $order->order_code,
            'order_date' => $order->created_at->format('d/m/Y H:i:s'),
            'customer' => $order->user->full_name,
            'phone' => $order->user->phone,
            'address' => $order->user->address . ', ' .
                $order->user->ward . ', ' .
                $order->user->district . ', ' .
                $order->user->city,
            'payment_method' => [
                $order->paymentMethods->name,
                $order->paymentMethods->description
            ],
            'payment_status' => $order->payment_status,
            'status' => $order->status,
            'total_amount' => number_format($order->total_amount, 0, ".", ""),
            'products' => $orderItems
        ];

        return response()->json([
            'status' => true,
            'order' => $formattedOrder
        ]);
    }

    // quản lý đơn hàng admin
    public function adminIndex(Request $request)
    {
        $query = Orders::with(['user', 'paymentMethods']);

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
            return [
                'order_id' => $order->order_id,
                'order_code' => $order->order_code,
                'customer' => $order->user ? $order->user->full_name : null,
                'total_amount' => number_format($order->total_amount, 0, '.', ''),
                'payment_status' => $order->payment_status,
                'payment_method' => $order->paymentMethods ? $order->paymentMethods->name : null,
                'status' => $order->status,
                'created_at' => $order->created_at->format('d/m/Y H:i:s'),
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
            'order_code' => $order->order_code,
            'order_date' => $order->created_at->format('d/m/Y H:i:s'),
            'customer' => $order->user ? $order->user->full_name : null,
            'phone' => $order->user ? $order->user->phone : null,
            'address' => $order->user ? ($order->user->address . ', ' . $order->user->ward . ', ' . $order->user->district . ', ' . $order->user->city) : null,
            'payment_method' => $order->paymentMethods ? [$order->paymentMethods->name, $order->paymentMethods->description] : null,
            'payment_status' => $order->payment_status,
            'status' => $order->status,
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
        $validTransitions = [
            'Chờ xác nhận' => ['Đã xác nhận', 'hủy'],
            'Đã xác nhận' => ['Đang vận chuyển/ Đang giao hàng'],
            'Đang vận chuyển/ Đang giao hàng' => ['Đã giao hàng'],
            // 'Đã giao hàng' => ['Hoàn thành/ Giao hàng thành công'],
            // 'Hoàn thành/ Giao hàng thành công' => [],
            // 'Trả hàng/Hoàn tiền' => ['Đã hoàn tiền'],
            // 'Đã hoàn tiền' => [],
            // 'Đã hủy' => [],
        ];

        if (!isset($validTransitions[$currentStatus]) || !in_array($nextStatus, $validTransitions[$currentStatus])) {
            return response()->json([
                'status' => false,
                'message' => 'Chuyển trạng thái không hợp lệ!'
            ], 400);
        }

        $order->status = $nextStatus;
        // Nếu chuyển sang Đã giao hàng và payment_status hiện tại là Chưa thanh toán thì tự động cập nhật
        if ($nextStatus === 'Đã giao hàng' && $order->payment_status === 'Chưa thanh toán') {
            $order->payment_status = 'Đã thanh toán';
        } elseif ($request->has('payment_status')) {
            $order->payment_status = $request->payment_status;
        }
        $order->save();
        return response()->json([
            'status' => true,
            'message' => 'Cập nhật trạng thái thành công',
            'order' => $order
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
        $order->status = 'Hoàn thành/ Giao hàng thành công';
        $order->save();
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
        if (!in_array($order->status, ['Đã giao hàng', 'Hoàn thành/ Giao hàng thành công'])) {
            return response()->json([
                'status' => false,
                'message' => 'Chỉ được yêu cầu hoàn hàng khi đơn hàng ở trạng thái Đã giao hàng hoặc Hoàn thành/ Giao hàng thành công'
            ], 400);
        }
        $request->validate([
            'return_reason' => 'required|string',
        ]);

        // Kiểm tra đã có yêu cầu hoàn hàng cho đơn này chưa
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
            'reason' => $request->return_reason,
            'status' => 'đã yêu cầu',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Đã gửi yêu cầu hoàn hàng',
            'return_request_id' => $returnId
        ]);
    }

    // Admin duyệt hoặc từ chối hoàn hàng (sử dụng bảng return_requests)
    public function adminHandleReturnRequest(Request $request, $id)
    {
        // Chấp nhận cả '1', '0', true, false từ form-data
        $approve = filter_var($request->input('approve'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        if (!is_bool($approve)) {
            return response()->json([
                'status' => false,
                'message' => 'Trường approve phải là true/false hoặc 1/0.'
            ], 422);
        }

        // Tìm yêu cầu hoàn hàng theo return_id (nếu truyền return_id) hoặc theo order_id
        $returnRequest = DB::table('return_requests')
            ->where('order_id', $id)
            ->whereIn('status', ['Đã yêu cầu', 'Đang xử lý'])
            ->first();
        if (!$returnRequest) {
            return response()->json([
                'status' => false,
                'message' => 'Không tìm thấy yêu cầu hoàn hàng đang chờ xử lý cho đơn hàng này'
            ], 404);
        }

        // Lấy số tiền hoàn trả từ return_requests
        $refundAmount = $returnRequest->refund_amount;

        // Cập nhật trạng thái yêu cầu hoàn hàng
        $newStatus = $approve ? 'Đã hoàn lại' : 'Đã từ chối';
        DB::table('return_requests')
            ->where('return_id', $returnRequest->return_id)
            ->update([
                'status' => $newStatus,
                'updated_at' => now(),
            ]);

        // Nếu duyệt hoàn tiền thì cập nhật trạng thái đơn hàng và trả tiền về refund_amount
        if ($approve) {
            $order = Orders::find($id);
            if ($order) {
                $order->status = 'Đã hoàn tiền';
                $order->payment_status = 'Đã hoàn tiền';
                // Nếu bảng orders có trường refund_amount thì cập nhật, nếu không thì chỉ trả về trong response
                if (isset($order->refund_amount)) {
                    $order->refund_amount = $refundAmount;
                }
                $order->save();
            }
        }

        return response()->json([
            'status' => true,
            'message' => $approve ? 'Đã duyệt hoàn tiền' : 'Đã từ chối hoàn hàng',
            'return_request_id' => $returnRequest->return_id,
            'return_request_status' => $newStatus,
            'refund_amount' => $approve ? $refundAmount : null
        ]);
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
        if ($order->status !== 'Chờ xác nhận') {
            return response()->json([
                'status' => false,
                'message' => 'Chỉ được hủy đơn hàng khi ở trạng thái Chờ xác nhận'
            ], 400);
        }
        // Kiểm tra quyền: chỉ chủ đơn hàng mới được hủy
        if ($order->user_id !== $request->user()->user_id) {
            return response()->json([
                'status' => false,
                'message' => 'Bạn không có quyền hủy đơn hàng này'
            ], 403);
        }
        $order->status = 'Đã hủy';
        $order->save();
        return response()->json([
            'status' => true,
            'message' => 'Đơn hàng đã được hủy thành công',
            'order' => $order
        ]);
    }
}
