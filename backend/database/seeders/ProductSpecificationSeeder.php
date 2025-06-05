<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductSpecificationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = DB::table('products')->get();
        
        foreach ($products as $product) {
            if (str_contains($product->name, 'iPhone 15')) {
                $this->createIPhone15Specs($product->product_id);
            }          
            else if (str_contains($product->name, 'iPhone 14')) {
                $this->createIPhone14Specs($product->product_id);
            }
            else if (str_contains($product->name, 'Galaxy S24')) {
                $this->createS24Specs($product->product_id);
            }
            else {
                $this->createBasicSpecs($product->product_id);
            }
        }
    }

    private function createIPhone15Specs($productId)
    {
        $specs = [
            ['spec_name' => 'Display', 'spec_value' => '6.7" Super Retina XDR OLED'],
            ['spec_name' => 'Processor', 'spec_value' => 'A17 Pro chip'],
            ['spec_name' => 'Camera', 'spec_value' => '48MP Main + 12MP Ultra Wide + 12MP Telephoto'],
            ['spec_name' => 'Battery', 'spec_value' => '4422 mAh'],
            ['spec_name' => 'Operating System', 'spec_value' => 'iOS 17'],
            ['spec_name' => 'Water Resistance', 'spec_value' => 'IP68'],
            ['spec_name' => 'Material', 'spec_value' => 'Titanium frame']
        ];

        $this->insertSpecs($productId, $specs);
    }

    private function createIPhone14Specs($productId)
    {
        $specs = [
            ['spec_name' => 'Display', 'spec_value' => '6.1" Super Retina XDR OLED'],
            ['spec_name' => 'Processor', 'spec_value' => 'A16 Bionic chip'],
            ['spec_name' => 'Camera', 'spec_value' => '48MP Main + 12MP Ultra Wide + 12MP Telephoto'],
            ['spec_name' => 'Battery', 'spec_value' => '3200 mAh'],
            ['spec_name' => 'Operating System', 'spec_value' => 'iOS 17'],
            ['spec_name' => 'Water Resistance', 'spec_value' => 'IP68'],
            ['spec_name' => 'Material', 'spec_value' => 'Stainless steel frame']
        ];

        $this->insertSpecs($productId, $specs);
    }

    private function createS24Specs($productId)
    {
        $specs = [
            ['spec_name' => 'Display', 'spec_value' => '6.8" Dynamic AMOLED 2X'],
            ['spec_name' => 'Processor', 'spec_value' => 'Snapdragon 8 Gen 3'],
            ['spec_name' => 'Camera', 'spec_value' => '200MP Main + 12MP Ultra Wide + 50MP Telephoto'],
            ['spec_name' => 'Battery', 'spec_value' => '5000 mAh'],
            ['spec_name' => 'Operating System', 'spec_value' => 'Android 14 with One UI 6.1'],
            ['spec_name' => 'Water Resistance', 'spec_value' => 'IP68'],
            ['spec_name' => 'Material', 'spec_value' => 'Titanium frame']
        ];

        $this->insertSpecs($productId, $specs);
    }

    private function createBasicSpecs($productId)
    {
        $specs = [
            ['spec_name' => 'Display', 'spec_value' => '6.5" AMOLED'],
            ['spec_name' => 'Processor', 'spec_value' => 'Snapdragon 8 Gen 2'],
            ['spec_name' => 'Camera', 'spec_value' => '50MP Main + 12MP Ultra Wide'],
            ['spec_name' => 'Battery', 'spec_value' => '4500 mAh'],
            ['spec_name' => 'Operating System', 'spec_value' => 'Android 14'],
            ['spec_name' => 'Water Resistance', 'spec_value' => 'IP67']
        ];

        $this->insertSpecs($productId, $specs);
    }

    private function insertSpecs($productId, $specs)
    {
        foreach ($specs as $spec) {
            DB::table('product_specifications')->insert([
                'product_id' => $productId,
                'spec_name' => $spec['spec_name'],
                'spec_value' => $spec['spec_value'],
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }
    }
}
