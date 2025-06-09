<?php
return [
    'vnp_TmnCode' => env('VNP_TMN_CODE', 'IT6I22QT'),
    'vnp_HashSecret' => env('VNP_HASH_SECRET', 'VLOARRNF9XL9BZN4UP1BNKBIRUR9HNY5'),
    'vnp_Url' => 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
    'vnp_ReturnUrl' => env('VNP_RETURN_URL', 'http://backend.test/api/vnpay/return'),
];
