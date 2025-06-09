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
        $colorAttributeId = DB::table('attributes')->where('name', 'Màu sắc')->first()->attribute_id;
        $storageAttributeId = DB::table('attributes')->where('name', 'Bộ nhớ')->first()->attribute_id;

        // Get attribute values
        $colors = DB::table('attribute_values')->where('attribute_id', $colorAttributeId)->get();
        $storages = DB::table('attribute_values')->where('attribute_id', $storageAttributeId)->get();

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

            // Assign color based on product type and image URL
            $colorValue = null;
            if (str_contains($product->name, 'iPhone')) {
                if (str_contains($variant->image_url, 'sa-mac')) {
                    $colorValue = $colors->firstWhere('value', 'Desert Titanium');
                } else if (str_contains($variant->image_url, 'titan-den') || str_contains(strtolower($variant->image_url), 'den-thumb') || str_contains(strtolower($variant->image_url), 'black-thumb')) {
                    $colorValue = $colors->firstWhere('value', 'Black Titanium');
                } else if (str_contains($variant->image_url, 'titan-trang') || str_contains(strtolower($variant->image_url), 'trang-thumbtgdd')) {
                    $colorValue = $colors->firstWhere('value', 'White Titanium');
                } else if (str_contains(strtolower($variant->image_url), 'xanh-mong')) {
                    $colorValue = $colors->firstWhere('value', 'Ultramarine');
                } else if (str_contains(strtolower($variant->image_url), 'iphone-16-plus-xanh')) {
                    $colorValue = $colors->firstWhere('value', 'Teal');
                } else if (str_contains(strtolower($variant->image_url), 'hong') || str_contains(strtolower($variant->image_url), 'pink')) {
                    $colorValue = $colors->firstWhere('value', 'Pink');
                } else if (str_contains(strtolower($variant->image_url), 'black-600x600')) {
                    $colorValue = $colors->firstWhere('value', 'Black');
                } else if (str_contains($variant->image_url, '6525424')) {
                    $colorValue = $colors->firstWhere('value', 'Blue Titanium');
                } else if (str_contains($variant->image_url, '6525425')) {
                    $colorValue = $colors->firstWhere('value', 'Black Titanium');
                } else if (str_contains($variant->image_url, '6525426')) {
                    $colorValue = $colors->firstWhere('value', 'White Titanium');
                } else if (str_contains(strtolower($variant->image_url), 'den') || str_contains(strtolower($variant->image_url), 'black')) {
                    $colorValue = $colors->firstWhere('value', 'Space Black');
                } else if (str_contains(strtolower($variant->image_url), 'tim') || str_contains(strtolower($variant->image_url), 'purple')) {
                    $colorValue = $colors->firstWhere('value', 'Deep Purple');
                } else if (str_contains(strtolower($variant->image_url), 'vang') || str_contains(strtolower($variant->image_url), 'gold')) {
                    $colorValue = $colors->firstWhere('value', 'Gold');
                } else if (str_contains(strtolower($variant->image_url), 'trang') || str_contains(strtolower($variant->image_url), 'white')) {
                    $colorValue = $colors->firstWhere('value', 'Starlight');
                } else if (str_contains(strtolower($variant->image_url), 'xanh-la')) {
                    $colorValue = $colors->firstWhere('value', 'Sierra Blue');
                } else if (str_contains($variant->image_url, '51CJE8vrvIL')) {
                    $colorValue = $colors->firstWhere('value', 'Space Black');
                } else if (str_contains($variant->image_url, '61nzPMNY8hL')) {
                    $colorValue = $colors->firstWhere('value', 'Deep Purple');
                } else if (str_contains($variant->image_url, '247508/iphone-14-pro-vang')) {
                    $colorValue = $colors->firstWhere('value', 'Gold');
                } else if (str_contains($variant->image_url, '247508/iphone-14-pro-den')) {
                    $colorValue = $colors->firstWhere('value', 'Space Black');
                } else if (str_contains($variant->image_url, '230529/iphone-13-pro-max-silver')) {
                    $colorValue = $colors->firstWhere('value', 'Starlight');
                } else if (str_contains($variant->image_url, '245545/iPhone-14-plus-thumb-do')) {
                    $colorValue = $colors->firstWhere('value', 'Red');
                } else if (str_contains($variant->image_url, '240259/iPhone-14-thumb-tim')) {
                    $colorValue = $colors->firstWhere('value', 'Purple');
                } else if (str_contains($variant->image_url, '307174/samsung-galaxy-s24-ultra-xanh')) {
                    $colorValue = $colors->firstWhere('value', 'Titanium Gray');
                } else if (str_contains($variant->image_url, 'f946bzuixxv')) {
                    $colorValue = $colors->firstWhere('value', 'Blue');
                }
            } else if (str_contains($product->name, 'Samsung')) {
                if (str_contains($variant->image_url, 'd_1.png')) {
                    $colorValue = $colors->firstWhere('value', 'Titanium Gray');
                } else if (str_contains($variant->image_url, 's24u_d')) {
                    $colorValue = $colors->firstWhere('value', 'Titanium Black');
                } else if (str_contains($variant->image_url, '51j7o')) {
                    $colorValue = $colors->firstWhere('value', 'Phantom Black');
                } else if (str_contains($variant->image_url, '41RWyFeX6kL')) {
                    $colorValue = $colors->firstWhere('value', 'Cream');
                } else if (str_contains($variant->image_url, '61IqkfGCw5L')) {
                    $colorValue = $colors->firstWhere('value', 'Mint');
                } else if (str_contains($variant->image_url, '61vJtKbAssL')) {
                    $colorValue = $colors->firstWhere('value', 'Lavender');
                }
            } else if (str_contains($product->name, 'Xiaomi')) {
                if (str_contains(strtolower($variant->image_url), 'den')) {
                    $colorValue = $colors->firstWhere('value', 'Black');
                } else if (str_contains(strtolower($variant->image_url), 'xanh')) {
                    $colorValue = $colors->firstWhere('value', 'Alpine Blue');
                }
            } else if (str_contains($product->name, 'Vivo')) {
                if (str_contains(strtolower($variant->image_url), 'den')) {
                    $colorValue = $colors->firstWhere('value', 'Black');
                } else if (str_contains(strtolower($variant->image_url), 'tim')) {
                    $colorValue = $colors->firstWhere('value', 'Purple');
                }
            } else if (str_contains($product->name, 'Tecno')) {
                if (str_contains($variant->image_url, 'Iconic_Black')) {
                    $colorValue = $colors->firstWhere('value', 'Iconic Black');
                } else if (str_contains($variant->image_url, 'Dark_Illusion')) {
                    $colorValue = $colors->firstWhere('value', 'Dark Illusion');
                }
            } else if (str_contains($product->name, 'Realme')) {
                if (str_contains($variant->image_url, '81r+hFt6pDL')) {
                    $colorValue = $colors->firstWhere('value', 'Sunrise Beige');
                } else {
                    $colorValue = $colors->firstWhere('value', 'Black');
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
        }
    }
}
