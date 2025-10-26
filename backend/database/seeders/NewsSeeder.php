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
        DB::table('news')->truncate(); // Xóa dữ liệu cũ trước khi seed

        $news = [
           [
    [
        'title' => 'Jack J97 đồng hành cùng vivo quảng bá sản phẩm mới',
        'user_id' => 1,
        'content' => 'Ca sĩ Jack J97 trở thành gương mặt đại diện trong chiến dịch quảng bá sản phẩm mới của vivo, thu hút sự quan tâm của giới trẻ.',
        'image_url' => 'https://cdn2.fptshop.com.vn/unsafe/Uploads/images/tin-tuc/126143/Originals/jack1.png',
        'created_at' => now(),
        'updated_at' => now(),
        'deleted_at' => null,
    ],
    [
        'title' => 'Jack J97 xuất hiện trong sự kiện ra mắt vivo S24',
        'user_id' => 1,
        'content' => 'Jack J97 gây ấn tượng khi góp mặt tại sự kiện ra mắt vivo S24, sản phẩm nổi bật với thiết kế sang trọng và camera đột phá.',
        'image_url' => 'https://channel.mediacdn.vn/2020/9/24/photo-2-16009218842091981777481.jpg',
        'created_at' => now(),
        'updated_at' => now(),
        'deleted_at' => null,
    ],
    [
        'title' => 'Jack J97 kết hợp vivo ra mắt dòng sản phẩm trẻ trung',
        'user_id' => 1,
        'content' => 'Dòng sản phẩm mới của vivo với thiết kế năng động được Jack J97 đồng hành quảng bá, hướng tới đối tượng người dùng trẻ tuổi.',
        'image_url' => 'https://nghenhinvietnam.vn//uploads/20221024/anh_chup_man_hinh_2020_10_06_luc_11_05_50_sa_qykp.png',
        'created_at' => now(),
        'updated_at' => now(),
        'deleted_at' => null,
    ],
    [
        'title' => 'Jack J97 và vivo ra mắt Find X7 Pro ấn tượng',
        'user_id' => 1,
        'content' => 'Jack J97 tiếp tục đồng hành cùng vivo trong buổi ra mắt Find X7 Pro – sản phẩm sở hữu công nghệ sạc siêu nhanh và camera ẩn dưới màn hình.',
        'image_url' => 'https://cdn.tgdd.vn/Files/2020/09/23/1292939/jack-vivo-v20-5_800x450.png',
        'created_at' => now(),
        'updated_at' => now(),
        'deleted_at' => null,
    ],
]

           
        ];

        foreach ($news as $item) {
            DB::table('news')->insert($item);
        }
    }
}
