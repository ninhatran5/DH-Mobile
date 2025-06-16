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
            ->select('order_id', 'order_code', 'user_id', 'total_amount', 'status','payment_status', 'method_id')
            ->where('user_id', $user->user_id)
            ->get();

        $formattedOrders = $orders->map(function ($order) {
            return [
                'order_id' => $order->order_id,
                'order_code' => $order->order_code,
                'customer' => $order->user->full_name,
                'total_amount' => number_format($order->total_amount ,0,".",""),
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
}
