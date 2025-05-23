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
        $images = [
            'https://cdn-media.sforum.vn/storage/app/media/nhattruong/iphone-16-series-52.jpg',
            'https://cdn-media.sforum.vn/storage/app/media/tiz/Apple-iPhone-16-finish-lineup-geo-240909.jpg',
            'https://cdn-media.sforum.vn/storage/app/media/doanphuong/reviewiphone16promax/review-iphone-16-pro-max-bg.jpg',
            'https://cdn-media.sforum.vn/storage/app/media/maithuong/so-sanh-oppo-reno14-pro-va-iphone-16-cover.jpg',
            'https://cdn-media.sforum.vn/storage/app/media/maithuong/oppo-reno14-pro-2.jpg',
            'https://scontent.fhan8-1.fna.fbcdn.net/v/t1.6435-9/119980738_3248806465232235_7314821825692360127_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=127cfc&_nc_ohc=421l_dzjV2kQ7kNvwGStB2R&_nc_oc=Adk9S1aJN2CgapC9AkKnO6iMknenYvK0ou0e6mXayDLYEPfxbadF7vuTYnbizW_Nzk4&_nc_zt=23&_nc_ht=scontent.fhan8-1.fna&_nc_gid=9ADRdZoTIe9rZqC3KVRdUQ&oh=00_AfJoLQrF3h9T_jgrMvVDzVtzBYJcIWRB97LC3CTJGdFyQA&oe=685790F7',
        ];
        $newsData = [];
        for ($i = 0; $i < 6; $i++) {
            $newsData[] = [
                'title' => $faker->sentence(6),
                'content' => $faker->paragraphs(3, true),
                'image_url' => $images[$i],
                'created_at' => now(),
                'updated_at' => now(),
                'deleted_at' => null,
            ];
        }
        DB::table('news')->insert($newsData);
    }
}
