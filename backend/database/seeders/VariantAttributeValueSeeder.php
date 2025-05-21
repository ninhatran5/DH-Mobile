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
            
            // Parse storage from SKU (assuming format includes storage value)
            preg_match('/(\d+(?:GB|TB))/', $variant->sku, $matches);
            $storageValue = $matches[1] ?? '128GB';
            
            // Find matching storage value_id
            $storageValue = $storages->first(function($storage) use ($storageValue) {
                return $storage->value === $storageValue;
            });

            if ($storageValue) {
                DB::table('variant_attribute_values')->insert([
                    'variant_id' => $variant->variant_id,
                    'value_id' => $storageValue->value_id
                ]);
            }

            // Assign color based on product type
            $color = null;
            if (str_contains($product->name, 'iPhone')) {
                $color = $colors->first(function($c) { return $c->value === 'Gold'; });
            } else if (str_contains($product->name, 'Samsung')) {
                $color = $colors->first(function($c) { return $c->value === 'Black'; });
            } else {
                $color = $colors->first(function($c) { return $c->value === 'Blue'; });
            }

            if ($color) {
                DB::table('variant_attribute_values')->insert([
                    'variant_id' => $variant->variant_id,
                    'value_id' => $color->value_id
                ]);
            }

            // Assign RAM based on storage size (higher storage = higher RAM)
            $ramSize = str_contains($storageValue->value ?? '', '1TB') ? '12GB' : 
                     (str_contains($storageValue->value ?? '', '512GB') ? '8GB' : 
                     (str_contains($storageValue->value ?? '', '256GB') ? '6GB' : '4GB'));
            
            $ramValue = $rams->first(function($ram) use ($ramSize) {
                return $ram->value === $ramSize;
            });

            if ($ramValue) {
                DB::table('variant_attribute_values')->insert([
                    'variant_id' => $variant->variant_id,
                    'value_id' => $ramValue->value_id
                ]);
            }
        }
    }
}
