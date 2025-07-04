<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Category; // <-- Import Category
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Hapus data produk lama
        Product::query()->delete();

        // 1. Ambil semua ID kategori yang ada ke dalam sebuah array.
        // Ini memastikan kita hanya bekerja dengan kategori yang sudah pasti ada.
        $categoryIds = Category::pluck('id')->all();

        // Jika tidak ada kategori, jangan buat produk sama sekali.
        if (empty($categoryIds)) {
            $this->command->info('No categories found, skipping product seeding.');
            return;
        }

        // 2. Gunakan factory untuk membuat 20 produk.
        // Untuk setiap produk yang dibuat, kita akan memberikan category_id secara acak.
        Product::factory(20)->create([
            'category_id' => function () use ($categoryIds) {
                return $categoryIds[array_rand($categoryIds)];
            },
        ]);
    }
}
