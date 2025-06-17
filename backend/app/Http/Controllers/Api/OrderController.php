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
            $variantInfo = '';
            $variantAttributes = [];

            if ($item->variant) {
                // Lấy thông tin biến thể (nếu có)
                $variantInfo = ' - ' . $item->variant->sku;

                // Lấy thông tin thuộc tính của biến thể
                $variantAttributes = $item->variant->variantAttributeValues->map(function($attrValue) {
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
}
