<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AttributeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $attributes = [
            ['name' => 'Color'],
            ['name' => 'Storage'],
            ['name' => 'RAM'],
        ];

        foreach ($attributes as $attribute) {
            DB::table('attributes')->insert([
                'name' => $attribute['name'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
