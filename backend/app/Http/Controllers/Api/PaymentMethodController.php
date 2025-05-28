<?php

namespace App\Http\Controllers\Api;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Payment_methods;

class PaymentMethodController extends Controller
{
    //

    public function addPayment(request $request){
          $Paymentdata = $request->validate([
            'name' => 'required|string|max:200',
            'description' => 'required|string',
        ]);

        $payment = Payment_methods::create($Paymentdata);

        return response()->json([
            'status' => true,
            'message' => 'Thêm phương thức thanh toán thành công',
            'data' => $payment
        ]);
    }
}
