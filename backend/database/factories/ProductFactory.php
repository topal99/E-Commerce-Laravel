<?php

namespace Database\Factories;

use App\Models\Category; // <-- Import Category
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str; // <-- Import Str
use App\Models\Product;

class ProductFactory extends Factory
{
    public function definition(): array
    {
        $productImages = [
        'baju1.jpg',
        'baju2.jpg',
        'baju3.jpg',
        'celana1.jpg',
        'celana2.jpg',
        'celana3.jpg',
        'gadget.jpg',
        'gadget2.jpg',
        'gadget3.jpg',
        'sepatu.jpg',
        'sepatu2.jpg',
        'sepatu3.jpg',
        'tas.jpg',
        'tas1.jpg',
        'tas2.jpg',
        ];

        $name = fake()->words(rand(2, 4), true); // Nama produk dari 2-4 kata
        $categoryIds = Category::pluck('id')->all();

        return [
            'user_id' => 2,
            'name' => Str::title($name), // Dibuat menjadi Title Case
            'slug' => Str::slug($name), // Slug unik
            'description' => fake()->paragraph(3),
            'price' => fake()->numberBetween(50000, 3000000),
            'stock' => fake()->numberBetween(5, 50),
            'category_id' => !empty($categoryIds) ? fake()->randomElement($categoryIds) : null,
            'image_url' => 'products/' . fake()->randomElement($productImages),
        ];
    }

    public function configure()
    {
        return $this->afterCreating(function (Product $product) {
            // Daftar gambar contoh untuk galeri
            $galleryImages = [
                'products/baju2.jpg',
                'products/sepatu1.png',
                'products/tas1.webp',
                'products/celana1.jpg',
            ];

            // Buat 2-4 gambar galeri acak untuk setiap produk
            for ($i = 0; $i < rand(2, 4); $i++) {
                $product->images()->create([
                    'image_url' => collect($galleryImages)->random()
                ]);
            }
        });
    }
}