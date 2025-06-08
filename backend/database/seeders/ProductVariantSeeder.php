<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductVariantSeeder extends Seeder
{
    public function run(): void
    {
        $products = DB::table('products')->get();

        foreach ($products as $product) {
            if (str_contains($product->name, 'iPhone')) {
                $this->createIPhoneVariants($product->product_id, $product->name);
            }
            else if (str_contains($product->name, 'Samsung')) {
                $this->createSamsungVariants($product->product_id, $product->name);
            }
            else if (str_contains($product->name, 'Xiaomi')) {
                $this->createXiaomiVariants($product->product_id, $product->name);
            }
            else if (str_contains($product->name, 'Vivo')) {
                $this->createVivoVariants($product->product_id, $product->name);
            }
            else if (str_contains($product->name, 'Tecno')) {
                $this->createTecnoVariants($product->product_id, $product->name);
            }
            else if (str_contains($product->name, 'Realme')) {
                $this->createRealmeVariants($product->product_id, $product->name);
            }
        }
    }

    private function createIPhoneVariants($productId, $productName)
    {
        if (str_contains($productName, 'iPhone 15 Pro Max')) {
            $variants = [
                [
                    'storage' => '256',
                    'price' => 31990000,
                    'price_original' => 33990000,
                    'stock' => 100,
                    'image_url' => 'https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6525/6525424_sd.jpg'
                ],
                [
                    'storage' => '512',
                    'price' => 35990000,
                    'price_original' => 37990000,
                    'stock' => 75,
                    'image_url' => 'https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6525/6525425_sd.jpg'
                ],
                [
                    'storage' => '1TB',
                    'price' => 41990000,
                    'price_original' => 43990000,
                    'stock' => 50,
                    'image_url' => 'https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6525/6525426_sd.jpg'
                ]
            ];
        } else if (str_contains($productName, 'iPhone 14 Pro Max')) {
            $variants = [
                [
                    'storage' => '128',
                    'price' => 27990000,
                    'price_original' => 29990000,
                    'stock' => 100,
                    'image_url' => 'https://cdn.tgdd.vn/Products/Images/42/251192/iphone-14-pro-max-den-thumb-600x600.jpg'
                ],
                [
                    'storage' => '256',
                    'price' => 30990000,
                    'price_original' => 32990000,
                    'stock' => 75,
                    'image_url' => 'https://cdn.tgdd.vn/Products/Images/42/251192/iphone-14-pro-max-tim-thumb-600x600.jpg'
                ],
                [
                    'storage' => '512',
                    'price' => 35990000,
                    'price_original' => 37990000,
                    'stock' => 50,
                    'image_url' => 'https://cdn.tgdd.vn/Products/Images/42/251192/iphone-14-pro-max-vang-thumb-600x600.jpg'
                ]
            ];
        } else if (str_contains($productName, 'iPhone 14 Pro')) {
            $variants = [
                [
                    'storage' => '128',
                    'price' => 24990000,
                    'price_original' => 26990000,
                    'stock' => 100,
                    'image_url' => 'https://m.media-amazon.com/images/I/51CJE8vrvIL._AC_UF894,1000_QL80_.jpg'
                ],
                [
                    'storage' => '256',
                    'price' => 27990000,
                    'price_original' => 29990000,
                    'stock' => 75,
                    'image_url' => 'https://m.media-amazon.com/images/I/61nzPMNY8hL._AC_UF1000,1000_QL80_.jpg'
                ]
            ];
        } else if (str_contains($productName, 'iPhone 14 Plus')) {
            $variants = [
                [
                    'storage' => '128',
                    'price' => 23990000,
                    'price_original' => 25990000,
                    'stock' => 100,
                    'image_url' => 'https://cdn.tgdd.vn/Products/Images/42/245545/iPhone-14-plus-thumb-den-600x600.jpg'
                ],
                [
                    'storage' => '256',
                    'price' => 26990000,
                    'price_original' => 28990000,
                    'stock' => 75,
                    'image_url' => 'https://cdn.tgdd.vn/Products/Images/42/245545/iPhone-14-plus-thumb-xanh-1-600x600.jpg'
                ]
            ];
        } else if (str_contains($productName, 'iPhone 14')) {
            $variants = [
                [
                    'storage' => '128',
                    'price' => 19990000,
                    'price_original' => 21990000,
                    'stock' => 100,
                    'image_url' => 'https://cdn.tgdd.vn/Products/Images/42/240259/iPhone-14-thumb-do-600x600.jpg'
                ],
                [
                    'storage' => '256',
                    'price' => 22990000,
                    'price_original' => 24990000,
                    'stock' => 75,
                    'image_url' => 'https://cdn.tgdd.vn/Products/Images/42/240259/iphone-14-trang-thumb-600x600.jpg'
                ]
            ];
        } else if (str_contains($productName, 'iPhone 13 Pro Max')) {
            $variants = [
                [
                    'storage' => '128',
                    'price' => 21990000,
                    'price_original' => 23990000,
                    'stock' => 100,
                    'image_url' => 'https://cdn.tgdd.vn/Products/Images/42/230529/iphone-13-pro-max-xanh-la-thumb-600x600.jpg'
                ],
                [
                    'storage' => '256',
                    'price' => 24990000,
                    'price_original' => 26990000,
                    'stock' => 75,
                    'image_url' => 'https://cdn.tgdd.vn/Products/Images/42/230529/iphone-13-pro-max-gold-1-600x600.jpg'
                ]
            ];
        }

        foreach ($variants as $variant) {
            DB::table('product_variants')->insert([
                'product_id' => $productId,
                'sku' => "IP-" . Str::slug($productName) . "-{$variant['storage']}-" . Str::random(4),
                'price' => $variant['price'],
                'price_original' => $variant['price_original'],
                'image_url' => $variant['image_url'],
                'stock' => $variant['stock'],
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }
    }

    private function createSamsungVariants($productId, $productName)
    {
        if (str_contains($productName, 'S24 Ultra')) {
            $variants = [
                [
                    'storage' => '256',
                    'price' => 29490000,
                    'price_original' => 31490000,
                    'stock' => 100,
                    'image_url' => 'https://cdn.xtmobile.vn/vnt_upload/product/05_2024/thumbs/600_d_1.png'
                ],
                [
                    'storage' => '512',
                    'price' => 32490000,
                    'price_original' => 34490000,
                    'stock' => 75,
                    'image_url' => 'https://cdn.xtmobile.vn/vnt_upload/product/05_2024/thumbs/600_s24u_d.png'
                ]
            ];
        } else if (str_contains($productName, 'Z Fold 5')) {
            $variants = [
                [
                    'storage' => '256',
                    'price' => 40990000,
                    'price_original' => 42990000,
                    'stock' => 100,
                    'image_url' => 'https://m.media-amazon.com/images/I/51j7o+cmJ-L._AC_UF894,1000_QL80_DpWeblab_.jpg'
                ],
                [
                    'storage' => '512',
                    'price' => 43990000,
                    'price_original' => 45990000,
                    'stock' => 75,
                    'image_url' => 'https://m.media-amazon.com/images/I/41RWyFeX6kL._AC_UF894,1000_QL80_.jpg'
                ]
            ];
        } else if (str_contains($productName, 'S24+')) {
            $variants = [
                [
                    'storage' => '256',
                    'price' => 25990000,
                    'price_original' => 27990000,
                    'stock' => 100,
                    'image_url' => 'https://images.openai.com/thumbnails/54b526810c7d73bd2d2e22d3add2fc84.jpeg'
                ],
                [
                    'storage' => '512',
                    'price' => 28990000,
                    'price_original' => 30990000,
                    'stock' => 75,
                    'image_url' => 'https://images.samsung.com/is/image/samsung/p6pim/vn/2401/gallery/vn-galaxy-s24-plus-s926-sm-s926bzsgxxv-thumb-539452184'
                ]
            ];
        } else if (str_contains($productName, 'Z Flip 5')) {
            $variants = [
                [
                    'storage' => '256',
                    'price' => 21990000,
                    'price_original' => 23990000,
                    'stock' => 100,
                    'image_url' => 'https://m.media-amazon.com/images/I/61IqkfGCw5L._AC_UF894,1000_QL80_.jpg'
                ],
                [
                    'storage' => '512',
                    'price' => 24990000,
                    'price_original' => 26990000,
                    'stock' => 75,
                    'image_url' => 'https://m.media-amazon.com/images/I/61vJtKbAssL._AC_UF894,1000_QL80_.jpg'
                ]
            ];
        }

        foreach ($variants as $variant) {
            DB::table('product_variants')->insert([
                'product_id' => $productId,
                'sku' => "SAM-" . Str::slug($productName) . "-{$variant['storage']}-" . Str::random(4),
                'price' => $variant['price'],
                'price_original' => $variant['price_original'],
                'image_url' => $variant['image_url'],
                'stock' => $variant['stock'],
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }
    }

    private function createXiaomiVariants($productId, $productName)
    {
        $variants = [
            [
                'storage' => '256',
                'price' => 15990000,
                'price_original' => 16990000,
                'stock' => 100,
                'image_url' => 'https://cdn.tgdd.vn/Products/Images/42/309816/xiaomi-13t-pro-xanh-thumb-600x600.jpg'
            ],
            [
                'storage' => '512',
                'price' => 17990000,
                'price_original' => 18990000,
                'stock' => 75,
                'image_url' => 'https://cdn.tgdd.vn/Products/Images/42/309816/xiaomi-13t-pro-den-thumb-600x600.jpg'
            ]
        ];

        foreach ($variants as $variant) {
            DB::table('product_variants')->insert([
                'product_id' => $productId,
                'sku' => "XIA-" . Str::slug($productName) . "-{$variant['storage']}-" . Str::random(4),
                'price' => $variant['price'],
                'price_original' => $variant['price_original'],
                'image_url' => $variant['image_url'],
                'stock' => $variant['stock'],
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }
    }

    private function createVivoVariants($productId, $productName)
    {
        if (str_contains($productName, 'V29e')) {
            $variants = [
                [
                    'storage' => '256',
                    'price' => 8990000,
                    'price_original' => 9990000,
                    'stock' => 100,
                    'image_url' => 'https://i.ebayimg.com/images/g/9vAAAOSwl7dk8fA3/s-l400.jpg'
                ],
                [
                    'storage' => '128',
                    'price' => 7990000,
                    'price_original' => 8990000,
                    'stock' => 75,
                    'image_url' => 'https://i.ebayimg.com/images/g/9vAAAOSwl7dk8fA3/s-l400.jpg'
                ]
            ];
        } else {
            $variants = [
                [
                    'storage' => '256',
                    'price' => 7990000,
                    'price_original' => 8990000,
                    'stock' => 100,
                    'image_url' => 'https://cdn.tgdd.vn/Products/Images/42/297026/vivo-v27e-tim-thumb-600x600.jpg'
                ],
                [
                    'storage' => '128',
                    'price' => 6990000,
                    'price_original' => 7990000,
                    'stock' => 75,
                    'image_url' => 'https://cdn.tgdd.vn/Products/Images/42/297026/vivo-v27e-den-thumb-600x600.jpg'
                ]
            ];
        }

        foreach ($variants as $variant) {
            DB::table('product_variants')->insert([
                'product_id' => $productId,
                'sku' => "VIV-" . Str::slug($productName) . "-{$variant['storage']}-" . Str::random(4),
                'price' => $variant['price'],
                'price_original' => $variant['price_original'],
                'image_url' => $variant['image_url'],
                'stock' => $variant['stock'],
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }
    }

    private function createTecnoVariants($productId, $productName)
    {
        if (str_contains($productName, 'Phantom')) {
            $variants = [
                [
                    'storage' => '256',
                    'price' => 11990000,
                    'price_original' => 12990000,
                    'stock' => 100,
                    'image_url' => 'https://d13pvy8xd75yde.cloudfront.net/phantom/fileadmin/sitedesign/Resources/Public/Image/product/phantomvflip/AD11_Iconic_Black.png'
                ]
            ];
        } else {
            $variants = [
                [
                    'storage' => '128',
                    'price' => 5990000,
                    'price_original' => 6490000,
                    'stock' => 100,
                    'image_url' => 'https://d13pvy8xd75yde.cloudfront.net/global/phones/pova-5-pro-5g/Drak%20Illusion.png'
                ]
            ];
        }

        foreach ($variants as $variant) {
            DB::table('product_variants')->insert([
                'product_id' => $productId,
                'sku' => "TEC-" . Str::slug($productName) . "-{$variant['storage']}-" . Str::random(4),
                'price' => $variant['price'],
                'price_original' => $variant['price_original'],
                'image_url' => $variant['image_url'],
                'stock' => $variant['stock'],
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }
    }

    private function createRealmeVariants($productId, $productName)
    {
        if (str_contains($productName, '11 Pro+')) {
            $variants = [
                [
                    'storage' => '256',
                    'price' => 12990000,
                    'price_original' => 13990000,
                    'stock' => 100,
                    'image_url' => 'https://m.media-amazon.com/images/I/81r+hFt6pDL._AC_UF894,1000_QL80_DpWeblab_.jpg'
                ]
            ];
        } else {
            $variants = [
                [
                    'storage' => '128',
                    'price' => 4290000,
                    'price_original' => 4990000,
                    'stock' => 100,
                    'image_url' => 'https://rukminim2.flixcart.com/image/850/1000/xif0q/mobile/q/k/f/-original-imagw3rhccszrram.jpeg?q=20&crop=false'
                ]
            ];
        }

        foreach ($variants as $variant) {
            DB::table('product_variants')->insert([
                'product_id' => $productId,
                'sku' => "REA-" . Str::slug($productName) . "-{$variant['storage']}-" . Str::random(4),
                'price' => $variant['price'],
                'price_original' => $variant['price_original'],
                'image_url' => $variant['image_url'],
                'stock' => $variant['stock'],
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }
    }
}
