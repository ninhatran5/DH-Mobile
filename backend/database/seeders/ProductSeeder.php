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
                'price' => 1299.99,
                'price_original' => 1399.99,
                'image_url' => 'https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6525/6525424_sd.jpg'
            ],
            [
                'category_name' => 'iPhone',
                'name' => 'iPhone 14 Pro',
                'description' => 'Features A16 Bionic chip, 48MP main camera, and Dynamic Island',
                'price' => 999.99,
                'price_original' => 1099.99,
                'image_url' => '    https://m.media-amazon.com/images/I/51CJE8vrvIL._AC_UF894,1000_QL80_.jpg'
            ],
            [
                'category_name' => 'Samsung',
                'name' => 'Samsung Galaxy S24 Ultra',
                'description' => 'Premium Android flagship with S Pen support and advanced AI features',
                'price' => 1199.99,
                'price_original' => 1299.99,
                'image_url' => 'https://cdn.xtmobile.vn/vnt_upload/product/05_2024/thumbs/600_d_1.png'
            ],
            [
                'category_name' => 'Samsung',
                'name' => 'Samsung Galaxy Z Fold 5',
                'description' => 'Foldable smartphone with large internal display',
                'price' => 1799.99,
                'price_original' => 1899.99,
                'image_url' => 'https://m.media-amazon.com/images/I/51j7o+cmJ-L._AC_UF894,1000_QL80_DpWeblab_.jpg'
            ],
            [
                'category_name' => 'Xiaomi',
                'name' => 'Xiaomi 14 Pro',
                'description' => 'Flagship phone with Snapdragon 8 Gen 3',
                'price' => 899.99,
                'price_original' => 999.99,
                'image_url' => 'https://m.media-amazon.com/images/I/51hOisZjbeL._AC_UF894,1000_QL80_.jpg'
            ],
            [
                'category_name' => 'OPPO',
                'name' => 'OPPO Find X7 Ultra',
                'description' => 'Premium smartphone with advanced camera system',
                'price' => 999.99,
                'price_original' => 1099.99,
                'image_url' => 'https://cdn1.smartprix.com/rx-ik3vhMXpY-w1200-h1200/k3vhMXpY.webp'
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
                'price' => $product['price'],
                'price_original' => $product['price_original'],
                'image_url' => $product['image_url'],
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }
    }
}
