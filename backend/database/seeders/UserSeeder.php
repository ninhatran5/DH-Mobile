<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Carbon\Carbon;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Admin và các role mặc định
        $roles = ['admin', 'customer', 'sale', 'shipper', 'checker'];

        foreach ($roles as $index => $role) {
            DB::table('users')->insert([
                'username'    => $role . '_user',
                'password_hash' => Hash::make('12345678'),
                'email'       => $role . '@gmail.com',
                'full_name'   => ucfirst($role) . ' User',
                'phone'       => '012345678' . $index,
                'address'     => '123 ' . ucfirst($role) . ' Street',
                'image_url'   => 'https://via.placeholder.com/150',
                'role'        => $role,
                'created_at'  => now(),
                'updated_at'  => now()
            ]);
        }

        // Thêm các user khách hàng
        $customers = [
            [
                'username' => 'x$ng',
                'password_hash' => '$2y$12$j1mxQPpakSgOLWWQ8BrxMuM5eMqtAUC1p0uwBkotNCUMAqH73z4Ie',
                'email' => 'tungnguyenle0909@gmail.com',
                'full_name' => 'Lê Nguyên Tùng',
                'phone' => '01656502625',
                'address' => 'Khu phố 8, thị trấn Thiệu Hóa, huyện Thiệu Hóa, tỉnh Thanh Hóa',
                'ward' => 'Xã An Thái',
                'district' => 'Huyện An Lão',
                'city' => 'Thành phố Hải Phòng',
                'image_url' => 'https://res.cloudinary.com/dvxpjf2zb/image/upload/v1747896461/users/oib08m30ezexzmdtggzu.jpg',
                'role' => 'customer',
                'created_at' => '2025-05-22 03:42:09',
                'updated_at' => '2025-05-22 08:11:55'
            ],
            [
                'username' => 'dfsf',
                'password_hash' => '$2y$12$O0lIXtzms1DtdllWKJvdWed7SSmI45JCnQeUKwkrItWLtjn9kmwtK',
                'email' => 'tung.ln@mor.com.vn',
                'full_name' => 'Xèng',
                'phone' => '0396180619',
                'address' => 'Thanh hóa',
                'ward' => 'Xã Tề Lễ',
                'district' => 'Huyện Tam Nông',
                'city' => 'Tỉnh Phú Thọ',
                'image_url' => 'https://res.cloudinary.com/dvxpjf2zb/image/upload/v1747888442/users/ojju0ueo5bkigm2ygqcg.jpg',
                'role' => 'customer',
                'created_at' => '2025-05-22 03:43:12',
                'updated_at' => '2025-05-22 04:34:03'
            ],
            [
                'username' => 'xengne',
                'password_hash' => '$2y$12$9AlfJ2A5uOS6oWwrLutkxur1Ru4ygx3OG8uLhyK5iMjIoFlmkdaeK',
                'email' => 'tunglnph49038@gmail.com',
                'full_name' => 'Lê Nguyên Tùng',
                'phone' => '0396180619',
                'address' => 'Bắc Ninh',
                'ward' => 'Xã Hà Hiệu',
                'district' => 'Huyện Ba Bể',
                'city' => 'Tỉnh Bắc Kạn',
                'image_url' => 'https://res.cloudinary.com/dvxpjf2zb/image/upload/v1747894504/users/pijni8w5njfy7mombyc6.jpg',
                'role' => 'customer',
                'created_at' => '2025-05-22 06:14:22',
                'updated_at' => '2025-05-22 06:29:00'
            ],
            [
                'username' => 'hquan12323',
                'password_hash' => Hash::make('Quanhp@123'),
                'email' => 'hquan12323@gmail.com',
                'full_name' => 'Hoàng Quân',
                'phone' => '0987654321',
                'address' => 'Hải Phòng',
                'ward' => 'Phường Thượng Lý',
                'district' => 'Quận Hồng Bàng',
                'city' => 'Thành phố Hải Phòng',
                'image_url' => 'https://res.cloudinary.com/dvxpjf2zb/image/upload/v1747896461/users/default-admin.jpg',
                'role' => 'admin',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'username' => 'duyhung05',
                'password_hash' => Hash::make('Hunghp@123'),
                'email' => 'duyhung05@gmail.com',
                'full_name' => 'Duy Hưng',
                'phone' => '0123456789',
                'address' => 'Hải Phòng',
                'ward' => 'Phường Quán Toan',
                'district' => 'Quận Hồng Bàng',
                'city' => 'Thành phố Hải Phòng',
                'image_url' => 'https://res.cloudinary.com/dvxpjf2zb/image/upload/v1747896461/users/default-admin.jpg',
                'role' => 'admin',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'username' => 'ninhatran',
                'password_hash' => Hash::make('Ninh@123'),
                'email' => 'ninhtnph49084@gmail.com',
                'full_name' => 'Nhật Ninh Trần',
                'phone' => '0971366828',
                'address' => 'Vĩnh Phúc',
                'ward' => 'Thị Trấn Hợp Hòa',
                'district' => 'Huyện Tam Dương',
                'city' => 'Tỉnh Vĩnh phúc',
                'image_url' => 'https://res.cloudinary.com/dvxpjf2zb/image/upload/v1747896461/users/default-admin.jpg',
                'role' => 'admin',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'username' => 'ninhatran5',
                'password_hash' => Hash::make('Ninh@123'),
                'email' => 'tnnpalk@gmail.com',
                'full_name' => 'Nhật Ninh Trần',
                'phone' => '0971366828',
                'address' => 'Vĩnh Phúc',
                'ward' => 'Thị Trấn Hợp Hòa',
                'district' => 'Huyện Tam Dương',
                'city' => 'Tỉnh Vĩnh phúc',
                'image_url' => 'https://res.cloudinary.com/dvxpjf2zb/image/upload/v1747896461/users/default-admin.jpg',
                'role' => 'customer',
                'created_at' => now(),
                'updated_at' => now()
            ]
        ];

        foreach ($customers as $customer) {
            DB::table('users')->insert($customer);
        }
    }
}
