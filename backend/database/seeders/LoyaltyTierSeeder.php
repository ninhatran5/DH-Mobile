<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class LoyaltyTierSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('loyalty_tiers')->insert([
            [
                'name' => 'Đồng',
                'min_points' => 0,
                'image_url' => 'https://res.cloudinary.com/dvxpjf2zb/image/upload/v1751509515/%C4%90o%CC%82%CC%80ng_kc0kio.png', 
                'discount_percent' => 0,
                'description' => 'Thành viên Đồng',
                'created_at' => Carbon::now(),
            ],
            [
                'name' => 'Bạc',
                'min_points' => 100000,
                'image_url' => 'https://res.cloudinary.com/dvxpjf2zb/image/upload/v1751509514/Ba%CC%A3c_nkgbsb.png', 
                'discount_percent' => 5,
                'description' => 'Thành viên Bạc',
                'created_at' => Carbon::now(),
            ],
            [
                'name' => 'Vàng',
                'min_points' => 200000,
                'image_url' => 'https://res.cloudinary.com/dvxpjf2zb/image/upload/v1751509515/Va%CC%80ng_riphkz.png', 
                'discount_percent' => 10,
                'description' => 'Thành viên Vàng',
                'created_at' => Carbon::now(),
            ],
            [
                'name' => 'Kim cương',
                'min_points' => 1000000,
                'image_url' => 'https://res.cloudinary.com/dvxpjf2zb/image/upload/v1751509515/Kim_cu%CC%9Bo%CC%9Bng_sngmpr.png', 
                'discount_percent' => 15,
                'description' => 'Thành viên Kim cương',
                'created_at' => Carbon::now(),
            ],
        ]);
    }
}
