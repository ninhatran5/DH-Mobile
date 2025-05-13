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
        $now = Carbon::now();

        $roles = ['admin', 'customer', 'sale', 'shipper', 'checker'];

        foreach ($roles as $index => $role) {
            DB::table('users')->insert([
                'username'    => $role . '_user',
                'password_hash' => Hash::make('12345678'), // hoặc bcrypt
                'email'       => $role . '@gmail.com',
                'full_name'   => ucfirst($role) . ' User',
                'phone'       => '012345678' . $index,
                'address'     => '123 ' . ucfirst($role) . ' Street',
                'image_url'   => 'https://via.placeholder.com/150',
                'role'        => $role,
            ]);
        }
    }
}

