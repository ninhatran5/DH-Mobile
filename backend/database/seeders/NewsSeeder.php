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
                'title' => 'iPhone 15 ra mắt với nhiều cải tiến',
                'user_id' => 1,
                'content' => 'Apple vừa chính thức giới thiệu iPhone 15 với nhiều tính năng mới và thiết kế hiện đại.',
                'image_url' => 'https://images2.thanhnien.vn/528068263637045248/2024/12/18/jack--17345360331611347307406.jpg',
                'created_at' => now(),
                'updated_at' => now(),
                'deleted_at' => null,
            ],
            [
                'title' => 'Samsung Galaxy S24 trình làng',
                'user_id' => 1,
                'content' => 'Samsung Galaxy S24 được trang bị camera AI và pin dung lượng lớn.',
                'image_url' => 'https://game8.vn/media/202207/images/3751224195569329541.jpg',
                'created_at' => now(),
                'updated_at' => now(),
                'deleted_at' => null,
            ],
            [
                'title' => 'Xiaomi ra mắt dòng Redmi Note mới',
                'user_id' => 1,
                'content' => 'Redmi Note mới của Xiaomi có giá thành hợp lý và cấu hình mạnh mẽ.',
                'image_url' => 'https://i.pinimg.com/736x/fa/fc/4b/fafc4b1052deae2438681e45ff7335a5.jpg',
                'created_at' => now(),
                'updated_at' => now(),
                'deleted_at' => null,
            ],
            [
                'title' => 'OPPO Find X7 Pro chính thức lên kệ',
                'user_id' => 1,
                'content' => 'OPPO Find X7 Pro sở hữu camera ẩn dưới màn hình và sạc siêu nhanh.',
                'image_url' => 'https://game8.vn/media/202207/images/joker-viet.jpg',
                'created_at' => now(),
                'updated_at' => now(),
                'deleted_at' => null,
            ],
           
        ];

        foreach ($news as $item) {
            DB::table('news')->insert($item);
        }
    }
}
