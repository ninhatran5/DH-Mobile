<?php

namespace Database\Seeders;

use App\Models\Voucher;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class VoucherSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        $vouchers = collect(range(1, 10))->map(function () {
            return [
                'code' => strtoupper(Str::random(18)),
                'title' => 'Voucher ' . Str::random(12),
                'discount_amount' => rand(5, 50),
                'min_order_value' => rand(50, 500),
                'start_date' => now(),
                'end_date' => now()->addDays(rand(10, 90)),
                'is_active' => (bool)rand(0, 1),
            ];
        })->toArray();
        foreach ($vouchers as $vorcher) {
            Voucher::create([
                'code' => $vorcher['code'],
                'title' => $vorcher['title'],
                'discount_amount' => $vorcher['discount_amount'],
                'min_order_value' => $vorcher['min_order_value'],
                'start_date' => $vorcher['start_date'],
                'end_date' => $vorcher['end_date'],
                'is_active' => $vorcher['is_active'],
            ]);
        }
    }
}
