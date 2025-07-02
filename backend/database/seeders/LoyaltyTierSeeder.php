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
                'name' => 'Bạc',
                'min_points' => 0,
                'discount_percent' => 5,
                'description' => 'Thành viên Bạc',
                'created_at' => Carbon::now(),
            ],
            [
                'name' => 'Vàng',
                'min_points' => 1000,
                'discount_percent' => 10,
                'description' => 'Thành viên Vàng',
                'created_at' => Carbon::now(),
            ],
            [
                'name' => 'Kim cương',
                'min_points' => 5000,
                'discount_percent' => 15,
                'description' => 'Thành viên Kim cương',
                'created_at' => Carbon::now(),
            ],
        ]);
    }
}
