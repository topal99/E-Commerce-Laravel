<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        // Hapus data lama untuk menghindari duplikat
        DB::table('categories')->delete();

        // Daftar kategori dengan nama dan ikon yang sudah ditentukan
        $categories = [
            ['name' => 'Fashion', 'icon' => 'shirt'],
            ['name' => 'Gadgets', 'icon' => 'smartphone'],
            ['name' => 'Watches', 'icon' => 'watch'],
            ['name' => 'Furniture', 'icon' => 'armchair'],
            ['name' => 'Sports', 'icon' => 'bike'],
            ['name' => 'Groceries', 'icon' => 'shopping-basket'],
            ['name' => 'Lighting', 'icon' => 'lamp'],
            ['name' => 'Office', 'icon' => 'briefcase'],
        ];

        // Loop dan masukkan data ke database
        foreach ($categories as $category) {
            DB::table('categories')->insert([
                'name' => $category['name'],
                'slug' => Str::slug($category['name']),
                'icon' => $category['icon'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}