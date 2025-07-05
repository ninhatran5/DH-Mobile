<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    // php artisan migrate:fresh --seed
    public function run(): void
    {
        // User::factory(10)->create();

        // User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);
        //  $this->call(UserSeeder::class);
        $this->call([ 
             LoyaltyTierSeeder::class,
            AttributeSeeder::class,
            AttributeValueSeeder::class,
            CategorySeeder::class,
            ProductSeeder::class,
            ProductVariantSeeder::class,
            ProductSpecificationSeeder::class,
            VariantAttributeValueSeeder::class,
            UserSeeder::class,
            BannerSeeder::class,
            NewsSeeder::class,
            // VoucherSeeder::class,
            ChatbotSeeder::class,
            PaymentMethodSeeder::class,
          
           
        ]);
    }
}
