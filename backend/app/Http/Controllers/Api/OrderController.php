<?php

namespace App\Http\Controllers\Api;

use App\Models\Orders;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;



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
        // Định nghĩa thứ tự trạng thái hợp lệ
        $validTransitions = [
            'Chờ xác nhận' => 'Chờ lấy hàng',
            'Chờ lấy hàng' => 'Đang giao',
            'Đang giao' => 'Đã giao',
            // Có thể bổ sung các trạng thái tiếp theo nếu cần
        ];

        // Kiểm tra chuyển trạng thái hợp lệ
        if (!isset($validTransitions[$currentStatus]) || $validTransitions[$currentStatus] !== $nextStatus) {
            return response()->json([
                'status' => false,
                'message' => 'Chỉ được chuyển trạng thái theo thứ tự: Chờ xác nhận → Chờ lấy hàng → Đang giao → Đã giao'
            ], 400);
        }

        $order->status = $nextStatus;
        // Nếu chuyển sang Đã giao và payment_status hiện tại là Chưa thanh toán thì tự động cập nhật
        if ($nextStatus === 'Đã giao' && $order->payment_status === 'Chưa thanh toán') {
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
}
