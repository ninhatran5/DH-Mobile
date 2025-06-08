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
                'price' => 31990000,
                'price_original' => 33990000,
                'image_url' => 'https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6525/6525424_sd.jpg'
            ],
            [
                'category_name' => 'iPhone',
                'name' => 'iPhone 14 Pro',
                'description' => 'Features A16 Bionic chip, 48MP main camera, and Dynamic Island',
                'price' => 24990000,
                'price_original' => 26990000,
                'image_url' => 'https://m.media-amazon.com/images/I/51CJE8vrvIL._AC_UF894,1000_QL80_.jpg'
            ],
            [
                'category_name' => 'iPhone',
                'name' => 'iPhone 13 Pro Max',
                'description' => 'Features A15 Bionic chip, ProMotion display, and pro camera system',
                'price' => 21990000,
                'price_original' => 23990000,
                'image_url' => 'https://cdn.tgdd.vn/Products/Images/42/230529/iphone-13-pro-max-xanh-la-thumb-600x600.jpg'
            ],
            [
                'category_name' => 'iPhone',
                'name' => 'iPhone 14 Pro Max',
                'description' => 'Features A16 Bionic chip, 48MP camera system, and Dynamic Island',
                'price' => 27990000,
                'price_original' => 29990000,
                'image_url' => 'https://cdn.tgdd.vn/Products/Images/42/251192/iphone-14-pro-max-vang-thumb-600x600.jpg'
            ],
            [
                'category_name' => 'iPhone',
                'name' => 'iPhone 14 Plus',
                'description' => 'Features A15 Bionic chip, larger 6.7-inch display',
                'price' => 23990000,
                'price_original' => 25990000,
                'image_url' => 'https://cdn.tgdd.vn/Products/Images/42/245545/iPhone-14-plus-thumb-den-600x600.jpg'
            ],
            [
                'category_name' => 'iPhone',
                'name' => 'iPhone 14',
                'description' => 'Features A15 Bionic chip, advanced camera system',
                'price' => 19990000,
                'price_original' => 21990000,
                'image_url' => 'https://cdn.tgdd.vn/Products/Images/42/240259/iPhone-14-thumb-do-600x600.jpg'
            ],
            [
                'category_name' => 'Samsung',
                'name' => 'Samsung Galaxy S24 Ultra',
                'description' => 'Premium Android flagship with S Pen support and advanced AI features',
                'price' => 29490000,
                'price_original' => 31490000,
                'image_url' => 'https://cdn.xtmobile.vn/vnt_upload/product/05_2024/thumbs/600_d_1.png'
            ],
            [
                'category_name' => 'Samsung',
                'name' => 'Samsung Galaxy Z Fold 5',
                'description' => 'Foldable smartphone with large internal display',
                'price' => 43990000,
                'price_original' => 45990000,
                'image_url' => 'https://m.media-amazon.com/images/I/51j7o+cmJ-L._AC_UF894,1000_QL80_DpWeblab_.jpg'
            ],
            [
                'category_name' => 'Samsung',
                'name' => 'Samsung Galaxy S24+',
                'description' => 'High-end smartphone with premium features and AI capabilities',
                'price' => 25990000,
                'price_original' => 27990000,
                'image_url' => 'https://images.openai.com/thumbnails/54b526810c7d73bd2d2e22d3add2fc84.jpeg'
            ],
            [
                'category_name' => 'Samsung',
                'name' => 'Samsung Galaxy Z Flip 5',
                'description' => 'Compact foldable smartphone with innovative design',
                'price' => 21990000,
                'price_original' => 23990000,
                'image_url' => 'https://m.media-amazon.com/images/I/61IqkfGCw5L._AC_UF894,1000_QL80_.jpg'
            ],
            [
                'category_name' => 'Xiaomi',
                'name' => 'Xiaomi 13T Pro',
                'description' => 'Premium mid-range with great camera system',
                'price' => 15990000,
                'price_original' => 16990000,
                'image_url' => 'https://cdn.tgdd.vn/Products/Images/42/309816/xiaomi-13t-pro-xanh-thumb-600x600.jpg'
            ],
            [
                'category_name' => 'Vivo',
                'name' => 'Vivo V29e',
                'description' => 'Mid-range phone with excellent camera',
                'price' => 8990000,
                'price_original' => 9990000,
                'image_url' => 'https://i.ebayimg.com/images/g/9vAAAOSwl7dk8fA3/s-l400.jpg'
            ],
            [
                'category_name' => 'Vivo',
                'name' => 'Vivo V27e',
                'description' => 'Stylish mid-range smartphone',
                'price' => 7990000,
                'price_original' => 8990000,
                'image_url' => 'https://cdn.tgdd.vn/Products/Images/42/297026/vivo-v27e-tim-thumb-600x600.jpg'
            ],
            [
                'category_name' => 'Tecno',
                'name' => 'Tecno Phantom V Flip',
                'description' => 'Affordable foldable smartphone',
                'price' => 11990000,
                'price_original' => 12990000,
                'image_url' => 'https://d13pvy8xd75yde.cloudfront.net/phantom/fileadmin/sitedesign/Resources/Public/Image/product/phantomvflip/AD11_Iconic_Black.png'
            ],
            [
                'category_name' => 'Tecno',
                'name' => 'Tecno Pova 5 Pro',
                'description' => 'Gaming-focused budget smartphone',
                'price' => 5990000,
                'price_original' => 6490000,
                'image_url' => 'https://d13pvy8xd75yde.cloudfront.net/global/phones/pova-5-pro-5g/Drak%20Illusion.png'
            ],
            [
                'category_name' => 'Realme',
                'name' => 'Realme 11 Pro+ 5G',
                'description' => 'Mid-range phone with 100MP camera',
                'price' => 12990000,
                'price_original' => 13990000,
                'image_url' => 'https://m.media-amazon.com/images/I/81r+hFt6pDL._AC_UF894,1000_QL80_DpWeblab_.jpg'
            ],
            [
                'category_name' => 'Realme',
                'name' => 'Realme C67',
                'description' => 'Budget phone with good performance',
                'price' => 4290000,
                'price_original' => 4990000,
                'image_url' => 'https://rukminim2.flixcart.com/image/850/1000/xif0q/mobile/q/k/f/-original-imagw3rhccszrram.jpeg?q=20&crop=false'
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
