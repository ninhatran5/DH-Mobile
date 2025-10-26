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
                'image_url' => 'https://res.cloudinary.com/dvxpjf2zb/image/upload/v1748945978/categories/nxt5q0zphk1ho1tgrnoi.png'
            ],
            [
                'name' => 'Samsung',
                'description' => 'Samsung smartphones including Galaxy series',
                'image_url' => 'https://res.cloudinary.com/dvxpjf2zb/image/upload/v1748945991/categories/gq6tqdsk85tlpna69xat.png'
            ],
            [
                'name' => 'Xiaomi',
                'description' => 'Xiaomi smartphones',
                'image_url' => 'https://res.cloudinary.com/dvxpjf2zb/image/upload/v1748946004/categories/v92i3rwqiqwrqqa1ps3e.png'
            ],
            [
                'name' => 'OPPO',
                'description' => 'OPPO smartphones',
                'image_url' => 'https://res.cloudinary.com/dvxpjf2zb/image/upload/v1748946021/categories/rmqhwksoeacjpewsmthw.png'
            ],
             [
                'name' => 'Vivo',
                'description' => 'Vivo smartphones',
                'image_url' => 'https://res.cloudinary.com/dvxpjf2zb/image/upload/v1748946056/categories/bwuqvht7vtnh0l9xkt4i.png'
             ],
             [
                'name' => 'Tecno',
                'description' => 'Tecno smartphones',
                'image_url' => 'https://res.cloudinary.com/dvxpjf2zb/image/upload/v1748946367/categories/w1anpsleqdosw2bro79c.png'
             ],
            [
                'name' => 'Realme',
                'description' => 'Realme smartphones',
                'image_url' => 'https://res.cloudinary.com/dvxpjf2zb/image/upload/v1748946953/categories/ljpb3x6yda9ce5bsz7vt.png'
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
