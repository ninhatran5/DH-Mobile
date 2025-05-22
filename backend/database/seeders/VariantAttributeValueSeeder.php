<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class VariantAttributeValueSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all variants
        $variants = DB::table('product_variants')->get();
        
        // Get attribute IDs
        $colorAttributeId = DB::table('attributes')->where('name', 'Color')->first()->attribute_id;
        $storageAttributeId = DB::table('attributes')->where('name', 'Storage')->first()->attribute_id;
        $ramAttributeId = DB::table('attributes')->where('name', 'RAM')->first()->attribute_id;

        // Get attribute values
        $colors = DB::table('attribute_values')->where('attribute_id', $colorAttributeId)->get();
        $storages = DB::table('attribute_values')->where('attribute_id', $storageAttributeId)->get();
        $rams = DB::table('attribute_values')->where('attribute_id', $ramAttributeId)->get();

        foreach ($variants as $variant) {
            // Get product info to determine which values to assign
            $product = DB::table('products')->where('product_id', $variant->product_id)->first();
            
            // Parse storage from SKU
            preg_match('/(\d+(?:GB|TB))/', $variant->sku, $matches);
            $storageStr = $matches[1] ?? '128GB';
            
            // Find matching storage value_id
            $storageValue = $storages->firstWhere('value', $storageStr);

            if ($storageValue) {
                DB::table('variant_attribute_values')->insert([
                    'variant_id' => $variant->variant_id,
                    'value_id' => $storageValue->value_id,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }

            // Assign color based on product type
            $colorValue = null;
            if (str_contains($product->name, 'iPhone')) {
                if (str_contains(strtolower($variant->image_url), 'black')) {
                    $colorValue = $colors->firstWhere('value', 'Black');
                } elseif (str_contains(strtolower($variant->image_url), 'white')) {
                    $colorValue = $colors->firstWhere('value', 'White');
                } elseif (str_contains(strtolower($variant->image_url), 'blue')) {
                    $colorValue = $colors->firstWhere('value', 'Blue');
                } else {
                    $colorValue = $colors->firstWhere('value', 'Gold');
                }
            } else if (str_contains($product->name, 'Samsung')) {
                if (str_contains(strtolower($variant->image_url), 'den')) {
                    $colorValue = $colors->firstWhere('value', 'Black');
                } elseif (str_contains(strtolower($variant->image_url), 'gold')) {
                    $colorValue = $colors->firstWhere('value', 'Gold');
                } else {
                    $colorValue = $colors->firstWhere('value', 'Silver');
                }
            } else {
                if (str_contains(strtolower($variant->image_url), 'den')) {
                    $colorValue = $colors->firstWhere('value', 'Black');
                } elseif (str_contains(strtolower($variant->image_url), 'xanh')) {
                    $colorValue = $colors->firstWhere('value', 'Blue');
                } else {
                    $colorValue = $colors->firstWhere('value', 'White');
                }
            }

            if ($colorValue) {
                DB::table('variant_attribute_values')->insert([
                    'variant_id' => $variant->variant_id,
                    'value_id' => $colorValue->value_id,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }

            // Assign RAM based on storage size more appropriately
            $ramSize = '';
            if (str_contains($storageStr, 'TB')) {
                $ramSize = '12GB';
            } else {
                $storageNum = (int)$storageStr;
                if ($storageNum >= 512) {
                    $ramSize = '8GB';
                } else if ($storageNum >= 256) {
                    $ramSize = '6GB';
                } else {
                    $ramSize = '4GB';
                }
            }
            
            $ramValue = $rams->firstWhere('value', $ramSize);

            if ($ramValue) {
                DB::table('variant_attribute_values')->insert([
                    'variant_id' => $variant->variant_id,
                    'value_id' => $ramValue->value_id,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }
        }
    }
}
