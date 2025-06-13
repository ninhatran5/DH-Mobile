<?php

namespace App\Http\Controllers\Api;

use App\Models\Orders;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;



class OrderController extends Controller
{
    public function getOrder(Request $request)
    {
        $request->user();
        $order = Orders::with('paymentMethods')->get();

        return response()->json([
            'status' => true,
            'order'  =>  $order
        ]);
    }
}
