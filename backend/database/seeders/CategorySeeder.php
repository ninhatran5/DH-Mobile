<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'iPhone',
                'description' => 'Apple iPhone smartphones',
                'image_url' => 'categories/iphone.jpg'
            ],
            [
                'name' => 'Samsung',
                'description' => 'Samsung smartphones including Galaxy series',
                'image_url' => 'categories/samsung.jpg'
            ],
            [
                'name' => 'Xiaomi',
                'description' => 'Xiaomi smartphones',
                'image_url' => 'categories/xiaomi.jpg'
            ],
            [
                'name' => 'OPPO',
                'description' => 'OPPO smartphones',
                'image_url' => 'categories/oppo.jpg'
            ]
        ];

        foreach ($categories as $category) {
            DB::table('categories')->insert([
                'name' => $category['name'],
                'description' => $category['description'],
                'image_url' => $category['image_url'],
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }
    }
}
