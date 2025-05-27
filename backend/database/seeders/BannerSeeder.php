<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BannerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $banners = [
            [
                'title' => 'Banner_1',
                'image_url' => 'https://res.cloudinary.com/dvxpjf2zb/image/upload/v1747942785/banners/xkmzz0wokcpi8mzpw6ys.jpg',
                'link_url' => null,
                'is_active' => true,
                'created_at' => '2025-05-22 03:24:24',
                'updated_at' => '2025-05-22 19:40:14'
            ],
            [
                'title' => 'Banner_2',
                'image_url' => 'https://res.cloudinary.com/dvxpjf2zb/image/upload/v1747884438/banners/bx7tq5izfxkcwhc3ni4t.jpg',
                'link_url' => null,
                'is_active' => true,
                'created_at' => '2025-05-22 03:24:36',
                'updated_at' => '2025-05-22 03:27:19'
            ],
            [
                'title' => 'Slider_1',
                'image_url' => 'https://res.cloudinary.com/dvxpjf2zb/image/upload/v1747884461/banners/w5htplfmdlv9akjglkxz.jpg',
                'link_url' => null,
                'is_active' => true,
                'created_at' => '2025-05-22 03:24:49',
                'updated_at' => '2025-05-22 03:27:41'
            ],
            [
                'title' => 'Slider_2',
                'image_url' => 'https://res.cloudinary.com/dvxpjf2zb/image/upload/v1747884482/banners/cwmufyknwpoyecrwx52c.jpg',
                'link_url' => null,
                'is_active' => true,
                'created_at' => '2025-05-22 03:25:00',
                'updated_at' => '2025-05-22 03:28:03'
            ],
            [
                'title' => 'Slider_3',
                'image_url' => 'https://res.cloudinary.com/dvxpjf2zb/image/upload/v1747884497/banners/hv7598we0af5mj70r6il.jpg',
                'link_url' => null,
                'is_active' => true,
                'created_at' => '2025-05-22 10:25:10',
                'updated_at' => '2025-05-22 03:28:18'
            ]
        ];

        foreach ($banners as $banner) {
            DB::table('banners')->insert($banner);
        }
    }
}
