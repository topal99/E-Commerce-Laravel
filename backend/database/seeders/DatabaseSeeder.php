<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {

        // Hapus user lama jika ada
        User::query()->delete();

        // Buat Admin
        User::create([
            'name' => 'Admin Super',
            'email' => 'admin@toko.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'email_verified_at' => now(), 
        ]);

        // Buat Pemilik Toko
        User::create([
            'name' => 'Toko Buku Aksara',
            'slug' => 'toko-buku-aksara',
            'email' => 'owner@toko.com',
            'password' => Hash::make('password'),
            'role' => 'store_owner',
            'bio' => 'Menjual berbagai macam buku fiksi dan non-fiksi original dengan harga terbaik.',
            'email_verified_at' => now(),
        ]);

        // Buat Customer
        User::create([
            'name' => 'Customer Biasa',
            'email' => 'customer@toko.com',
            'password' => Hash::make('password'),
            'role' => 'customer',
            'email_verified_at' => now(), 
        ]);

        // Panggil seeder lain
        $this->call([
            CategorySeeder::class,
            ProductSeeder::class,  
            CouponSeeder::class
        ]);
    }
}
