<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AttributeValueSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Color values
        $colorValues = ['Black', 'White', 'Gold', 'Silver', 'Blue'];
        $colorAttributeId = DB::table('attributes')->where('name', 'Color')->first()->attribute_id;
        foreach ($colorValues as $value) {
            DB::table('attribute_values')->insert([
                'attribute_id' => $colorAttributeId,
                'value' => $value,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Storage values
        $storageValues = ['128GB', '256GB', '512GB', '1TB'];
        $storageAttributeId = DB::table('attributes')->where('name', 'Storage')->first()->attribute_id;
        foreach ($storageValues as $value) {
            DB::table('attribute_values')->insert([
                'attribute_id' => $storageAttributeId,
                'value' => $value,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // RAM values
        $ramValues = ['4GB', '6GB', '8GB', '12GB'];
        $ramAttributeId = DB::table('attributes')->where('name', 'RAM')->first()->attribute_id;
        foreach ($ramValues as $value) {
            DB::table('attribute_values')->insert([
                'attribute_id' => $ramAttributeId,
                'value' => $value,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
