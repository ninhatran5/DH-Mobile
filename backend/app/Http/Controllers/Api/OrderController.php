<?php

namespace App\Http\Controllers\Api;

use App\Models\Orders;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Mail\OrderStatusUpdatedMail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class OrderController extends Controller
{
    public function getOrder(Request $request)
    {
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
                'total_amount' => number_format($order->total_amount, 0, ".", ""),
                'address' => $order->address . ', ' .
                    $order->ward . ', ' .
                    $order->district . ', ' .
                    $order->city,
                'payment_status' => $order->payment_status,
                'payment_method' => $order->paymentMethods->name,
                'status' => $order->status,
                'cancel_reason' => $order->cancel_reason,
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
            'customer' => $order->customer,
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
            return [
                'order_id' => $order->order_id,
                'order_code' => $order->order_code,
                'customer' =>  $order->customer,
                "image_url" => $order->user->image_url,
                'total_amount' => number_format($order->total_amount, 0, '.', ''),
                'payment_status' => $order->payment_status,
                'payment_method' => $order->paymentMethods ? $order->paymentMethods->name : null,
                'status' => $order->status,
                'cancel_reason' => $order->cancel_reason,
                'created_at' => $order->created_at->format('d/m/Y H:i:s'),
                'totalProduct' => $order->orderItems->sum('quantity'), // Tính tổng số lượng sản phẩm
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
            'customer' => $order->customer,
            'phone' => $order->phone,
            'address' => $order ? ($order->address . ', ' . $order->ward . ', ' . $order->district . ', ' . $order->city) : null,
            'payment_method' => $order->paymentMethods ? [$order->paymentMethods->name, $order->paymentMethods->description] : null,
            'payment_status' => $order->payment_status,
            'status' => $order->status,
            'cancel_reason' => $order->cancel_reason,
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
        $allowedStatuses = ['Chờ xác nhận', 'Đã xác nhận', 'Chờ lấy hàng', 'Đang vận chuyển', 'Đang giao hàng', 'Đã giao hàng', 'Hoàn thành'];
        $validTransitions = [
            'Chờ xác nhận' => ['Đã xác nhận'],
            'Đã xác nhận' => ['Chờ lấy hàng'],
            'Chờ lấy hàng' => ['Đang vận chuyển'],
            'Đang vận chuyển' => ['Đang giao hàng'],
            'Đang giao hàng' => ['Đã giao hàng'],
            'Đã giao hàng' => ['Hoàn thành'],
            'Hoàn thành' => []
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
        if ($nextStatus === 'Đã giao hàng' && $order->payment_status === 'Chưa thanh toán') {
            $order->payment_status = 'Đã thanh toán';
        } elseif ($request->has('payment_status')) {
            $order->payment_status = $request->payment_status;
        }
        $order->save();

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
        if (!in_array($order->status, ['Đã giao hàng', 'Hoàn thành'])) {
            return response()->json([
                'status' => false,
                'message' => 'Chỉ được yêu cầu hoàn hàng khi đơn hàng ở trạng thái Đã giao hàng hoặc Hoàn thành'
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
            'refund_amount' => $order->total_amount, // Lưu tổng tiền đã thanh toán vào refund_amount
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
        // Chỉ cho phép hủy khi trạng thái là Chờ xác nhận, Đã xác nhận hoặc Chờ lấy hàng
        if (!in_array($order->status, ['Chờ xác nhận', 'Đã xác nhận', 'Chờ lấy hàng'])) {
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
        $query = DB::table('return_requests')
            ->join('orders', 'return_requests.order_id', '=', 'orders.order_id')
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
        // Chỉ lấy yêu cầu hoàn trả gần nhất cho mỗi đơn hàng
        $results = $query
            ->orderBy('orders.order_id')
            ->orderByDesc('return_requests.created_at')
            ->get()
            ->unique('order_id');

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
        // Lấy thông tin đơn hàng
        $order = Orders::with(['user', 'paymentMethods', 'orderItems.product', 'orderItems.variant.variantAttributeValues.value.attribute'])
            ->where('order_id', $order_id)
            ->first();
        if (!$order) {
            return response()->json([
                'status' => false,
                'message' => 'Không tìm thấy đơn hàng'
            ], 404);
        }
        // Lấy các yêu cầu hoàn trả của đơn hàng này
        $returnRequests = DB::table('return_requests')
            ->where('order_id', $order_id)
            ->orderByDesc('created_at')
            ->get();

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
                'product_id' => $item->product_id,
                'product_name' => $item->product->name,
                'product_image' => $item->variant ? $item->variant->image_url : $item->product->image_url,
                'quantity' => $item->quantity,
                'price' => number_format($item->price, 0, '.', ''),
                'subtotal' => number_format($item->price * $item->quantity, 0, '.', ''),
                'variant_attributes' => $variantAttributes
            ];
        });

        // Định dạng các yêu cầu hoàn trả
        $returnRequestsFormatted = $returnRequests->map(function ($r) {
            return [
                'return_id' => $r->return_id,
                'reason' => $r->reason,
                'status' => $r->status,
                'refund_amount' => number_format($r->refund_amount, 0, '.', ''),
                'created_at' => $r->created_at ? date('d/m/Y H:i:s', strtotime($r->created_at)) : null,
            ];
        });

        $formattedOrder = [
            'order_id' => $order->order_id,
            'order_code' => $order->order_code,
            'customer' => $order->customer,
            'email' => $order->user ? $order->user->email : null,
            'total_amount' => number_format($order->total_amount, 0, '.', ''),
            'order_status' => $order->status,
            'payment_status' => $order->payment_status,
            'payment_method' => $order->paymentMethods ? $order->paymentMethods->name : null,
            'cancel_reason' => $order->cancel_reason,
            'order_created_at' => $order->created_at ? $order->created_at->format('d/m/Y H:i:s') : null,
            'products' => $orderItems,
            'return_requests' => $returnRequestsFormatted
        ];

        return response()->json([
            'status' => true,
            'order' => $formattedOrder
        ]);
    }
}
