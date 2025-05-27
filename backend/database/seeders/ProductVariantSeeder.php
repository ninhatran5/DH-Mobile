<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductVariantSeeder extends Seeder
{
    public function run(): void
    {
        $products = DB::table('products')->get();
        
        foreach ($products as $product) {
            if (str_contains($product->name, 'iPhone')) {
                $this->createIPhoneVariants($product->product_id, $product->name);
            }
            else if (str_contains($product->name, 'Samsung')) {
                $this->createSamsungVariants($product->product_id, $product->name);
            }
            else {
                $this->createBasicVariants($product->product_id, $product->name);
            }
        }
    }

    private function createIPhoneVariants($productId, $productName)
    {
        $variants = [
            [
                'storage' => '256',
                'price' => 1199.99,
                'price_original' => 1299.99,
                'stock' => 100,
                'image_url' => 'https://img.tgdd.vn/imgt/f_webp,fit_outside,quality_100/https://cdn.tgdd.vn/Products/Images/42/305658/iphone-15-pro-max-blue-thumbnew-600x600.jpg'
            ],
            [
                'storage' => '512',
                'price' => 1399.99,
                'price_original' => 1499.99,
                'stock' => 75,
                'image_url' => 'https://img.tgdd.vn/imgt/f_webp,fit_outside,quality_100/https://cdn.tgdd.vn/Products/Images/42/305658/iphone-15-pro-max-black-thumbnew-600x600.jpg'
            ],
            [
                'storage' => '1TB',
                'price' => 1599.99,
                'price_original' => 1699.99,
                'stock' => 50,
                'image_url' => 'https://img.tgdd.vn/imgt/f_webp,fit_outside,quality_100/https://cdn.tgdd.vn/Products/Images/42/305658/iphone-15-pro-max-white-thumbnew-600x600.jpg'
            ]
        ];

        foreach ($variants as $variant) {
            DB::table('product_variants')->insert([
                'product_id' => $productId,
                'sku' => "IP-" . Str::slug($productName) . "-{$variant['storage']}-" . Str::random(4),
                'price' => $variant['price'],
                'price_original' => $variant['price_original'],
                'image_url' => $variant['image_url'],
                'stock' => $variant['stock'],
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }
    }

    private function createSamsungVariants($productId, $productName)
    {
        $variants = [
            [
                'storage' => '256',
                'price' => 1199.99,
                'price_original' => 1299.99,
                'stock' => 100,
                'image_url' => 'https://cdn2.cellphones.com.vn/x358,webp,q100/media/catalog/product/s/2/s24-ultra-xam.png'
            ],
            [
                'storage' => '512',
                'price' => 1299.99,
                'price_original' => 1399.99,
                'stock' => 75,
                'image_url' => 'https://cdn2.cellphones.com.vn/x358,webp,q100/media/catalog/product/s/2/s24-ultra-den.png'
            ],
            [
                'storage' => '1TB',
                'price' => 1499.99,
                'price_original' => 1599.99,
                'stock' => 50,
                'image_url' => 'https://cdn2.cellphones.com.vn/x358,webp,q100/media/catalog/product/s/2/s24-ultra-gold.png'
            ]
        ];

        foreach ($variants as $variant) {
            DB::table('product_variants')->insert([
                'product_id' => $productId,
                'sku' => "SAM-" . Str::slug($productName) . "-{$variant['storage']}-" . Str::random(4),
                'price' => $variant['price'],
                'price_original' => $variant['price_original'], 
                'image_url' => $variant['image_url'],
                'stock' => $variant['stock'],
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }
    }

    private function createBasicVariants($productId, $productName)
    {
        $brand = strtolower(explode(' ', $productName)[0]);
        
        // Ảnh Xiaomi từ TGDD
        $xiaomiImages = [
            'https://img.tgdd.vn/imgt/f_webp,fit_outside,quality_100/https://cdn.tgdd.vn/Products/Images/42/309816/xiaomi-13t-xanh-1-600x600.jpg',
            'https://img.tgdd.vn/imgt/f_webp,fit_outside,quality_100/https://cdn.tgdd.vn/Products/Images/42/309816/xiaomi-13t-den-1-600x600.jpg'
        ];
        
        // Ảnh OPPO từ TGDD
        $oppoImages = [
            'https://img.tgdd.vn/imgt/f_webp,fit_outside,quality_100/https://cdn.tgdd.vn/Products/Images/42/274381/oppo-find-n2-flip-den-thumb-600x600.jpg',
            'https://img.tgdd.vn/imgt/f_webp,fit_outside,quality_100/https://cdn.tgdd.vn/Products/Images/42/274381/oppo-find-n2-flip-tim-thumb-600x600.jpg'
        ];
        
        $variants = [
            [
                'storage' => '128',
                'price' => 699.99,
                'price_original' => 799.99,
                'stock' => 100,
                'image_url' => str_contains(strtolower($productName), 'xiaomi') ? $xiaomiImages[0] : $oppoImages[0]
            ],
            [
                'storage' => '256',
                'price' => 799.99,
                'price_original' => 899.99,
                'stock' => 75,
                'image_url' => str_contains(strtolower($productName), 'xiaomi') ? $xiaomiImages[1] : $oppoImages[1]
            ]
        ];

        foreach ($variants as $variant) {
            DB::table('product_variants')->insert([
                'product_id' => $productId,
                'sku' => strtoupper(substr($brand, 0, 3)) . "-" . Str::slug($productName) . "-{$variant['storage']}-" . Str::random(4),
                'price' => $variant['price'],
                'price_original' => $variant['price_original'],
                'image_url' => $variant['image_url'],
                'stock' => $variant['stock'],
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }
    }
}
