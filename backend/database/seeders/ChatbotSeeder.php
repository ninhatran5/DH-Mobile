<?php 

namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ChatbotSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('chatbots')->insert([
            'name' => 'Bot Tư Vấn Khách Hàng',
            'description' => 'Bot hỗ trợ tư vấn khách hàng về sản phẩm, voucher, đơn hàng.',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now()
        ]);
    }
}
