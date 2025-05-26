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
                'image_url' => 'https://res.cloudinary.com/dvxpjf2zb/image/upload/v1748277630/categories/nuwxngeq4pyuisrevqry.jpg'
            ],
            [
                'name' => 'Samsung',
                'description' => 'Samsung smartphones including Galaxy series',
                'image_url' => 'https://res.cloudinary.com/dvxpjf2zb/image/upload/v1748277645/categories/euobkkqrq6u5zrd9ks2w.jpg'
            ],
            [
                'name' => 'Xiaomi',
                'description' => 'Xiaomi smartphones',
                'image_url' => 'https://res.cloudinary.com/dvxpjf2zb/image/upload/v1748277656/categories/orv3sx1aieltovlngrln.png'
            ],
            [
                'name' => 'OPPO',
                'description' => 'OPPO smartphones',
                'image_url' => 'https://res.cloudinary.com/dvxpjf2zb/image/upload/v1748277675/categories/loxih5ffrfcpmvscd63t.png'
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
