<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Faker\Factory as Faker;

class NewsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create();
        $newsData = [];
        for ($i = 0; $i < 6; $i++) {
            $newsData[] = [
                'title' => $faker->sentence(6),
                'content' => $faker->paragraphs(3, true),
                'image_url' => $faker->imageUrl(640, 480, 'business', true, 'Faker'),
                'created_at' => now(),
                'updated_at' => now(),
                'deleted_at' => null,
            ];
        }
        DB::table('news')->insert($newsData);
    }
}
