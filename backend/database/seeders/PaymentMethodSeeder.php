<?php

namespace Database\Seeders;

use App\Models\Payment_methods;
use Illuminate\Database\Seeder;

class PaymentMethodSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $paymentMethods = [

            [
                'name' => 'VNPay',
                'description' => 'Thanh toán qua VNPay',
                'is_active' => true,
            ],
            [
                'name' => 'COD',
                'description' => 'Thanh toán COD',
                'is_active' => true,
            ],
            [
                'name' => 'DHPay',
                'description' => 'Thanh toán qua ví DHPay',
                'is_active' => true,
            ],
        ];

        foreach ($paymentMethods as $method) {
            Payment_methods::create($method);
        }
    }
}
