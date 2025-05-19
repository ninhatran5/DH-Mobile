<?php
return [
    'cloud_url' => env('CLOUDINARY_URL'),

    // Thêm cấu hình thủ công để thay thế khi cloud_url bị lỗi
    'cloud' => [
        'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
        'api_key'    => env('CLOUDINARY_API_KEY'),
        'api_secret' => env('CLOUDINARY_API_SECRET'),
    ],

    'url' => [
        'secure' => true
    ],
];
