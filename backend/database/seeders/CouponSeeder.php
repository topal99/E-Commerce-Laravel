<?php

namespace Database\Seeders;

    use Illuminate\Database\Seeder;
    use App\Models\Coupon;

    class CouponSeeder extends Seeder
    {
        public function run(): void
        {
            Coupon::create([
                'code' => 'HEMAT10',
                'type' => 'percent',
                'value' => 10, // Diskon 10%
                'expires_at' => now()->addMonth(),
            ]);

            Coupon::create([
                'code' => 'ONGKIRGRATIS',
                'type' => 'fixed',
                'value' => 25000, // Potongan harga tetap Rp 25.000
                'expires_at' => now()->addWeek(),
            ]);
        }
    }