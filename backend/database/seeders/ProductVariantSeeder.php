<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductVariantSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = DB::table('products')->get();
        
        foreach ($products as $product) {
            // For iPhone variants
            if (str_contains($product->name, 'iPhone')) {
                $this->createIPhoneVariants($product->product_id, $product->name);
            }
            // For Samsung variants
            else if (str_contains($product->name, 'Samsung')) {
                $this->createSamsungVariants($product->product_id, $product->name);
            }
            // For other brands
            else {
                $this->createBasicVariants($product->product_id, $product->name);
            }
        }
    }

    private function createIPhoneVariants($productId, $productName)
    {
        $modelCode = Str::slug(str_replace(['iPhone', ' '], '', $productName));
        
        $variants = [
            [
                'storage' => '256',
                'price' => 1199.99,
                'stock' => 100
            ],
            [
                'storage' => '512',
                'price' => 1399.99,
                'stock' => 75
            ],
            [
                'storage' => '1TB',
                'price' => 1599.99,
                'stock' => 50
            ]
        ];

        foreach ($variants as $variant) {
            DB::table('product_variants')->insert([
                'product_id' => $productId,
                'sku' => "IP-{$modelCode}-{$variant['storage']}-" . Str::random(4),
                'price' => $variant['price'],
                'stock' => $variant['stock'],
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }
    }

    private function createSamsungVariants($productId, $productName)
    {
        $modelCode = Str::slug(str_replace(['Samsung', ' '], '', $productName));
        
        $variants = [
            [
                'storage' => '256',
                'price' => 1199.99,
                'stock' => 100
            ],
            [
                'storage' => '512',
                'price' => 1299.99,
                'stock' => 75
            ],
            [
                'storage' => '1TB',
                'price' => 1499.99,
                'stock' => 50
            ]
        ];

        foreach ($variants as $variant) {
            DB::table('product_variants')->insert([
                'product_id' => $productId,
                'sku' => "SAM-{$modelCode}-{$variant['storage']}-" . Str::random(4),
                'price' => $variant['price'],
                'stock' => $variant['stock'],
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }
    }

    private function createBasicVariants($productId, $productName)
    {
        $modelCode = Str::slug(str_replace([' '], '', $productName));
        
        $variants = [
            [
                'storage' => '128',
                'price' => 699.99,
                'stock' => 100
            ],
            [
                'storage' => '256',
                'price' => 799.99,
                'stock' => 75
            ]
        ];

        foreach ($variants as $variant) {
            DB::table('product_variants')->insert([
                'product_id' => $productId,
                'sku' => strtoupper(substr($modelCode, 0, 3)) . "-{$variant['storage']}-" . Str::random(4),
                'price' => $variant['price'],
                'stock' => $variant['stock'],
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }
    }
}
