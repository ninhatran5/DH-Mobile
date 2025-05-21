<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = [
            [
                'category_name' => 'iPhone',
                'name' => 'iPhone 15 Pro Max',
                'description' => 'The latest iPhone with A17 Pro chip, 48MP camera system, and titanium design',
                'image_url' => 'products/iphone-15-pro-max.jpg'
            ],
            [
                'category_name' => 'iPhone',
                'name' => 'iPhone 14 Pro',
                'description' => 'Features A16 Bionic chip, 48MP main camera, and Dynamic Island',
                'image_url' => 'products/iphone-14-pro.jpg'
            ],
            [
                'category_name' => 'Samsung',
                'name' => 'Samsung Galaxy S24 Ultra',
                'description' => 'Premium Android flagship with S Pen support and advanced AI features',
                'image_url' => 'products/samsung-s24-ultra.jpg'
            ],
            [
                'category_name' => 'Samsung',
                'name' => 'Samsung Galaxy Z Fold 5',
                'description' => 'Foldable smartphone with large internal display',
                'image_url' => 'products/samsung-fold-5.jpg'
            ],
            [
                'category_name' => 'Xiaomi',
                'name' => 'Xiaomi 14 Pro',
                'description' => 'Flagship phone with Snapdragon 8 Gen 3',
                'image_url' => 'products/xiaomi-14-pro.jpg'
            ],
            [
                'category_name' => 'OPPO',
                'name' => 'OPPO Find X7 Ultra',
                'description' => 'Premium smartphone with advanced camera system',
                'image_url' => 'products/oppo-find-x7.jpg'
            ]
        ];

        foreach ($products as $product) {
            $categoryId = DB::table('categories')
                ->where('name', $product['category_name'])
                ->first()
                ->category_id;

            DB::table('products')->insert([
                'category_id' => $categoryId,
                'name' => $product['name'],
                'description' => $product['description'],
                'image_url' => $product['image_url'],
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }
    }
}
