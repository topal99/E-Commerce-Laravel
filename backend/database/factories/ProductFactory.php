<?php

namespace Database\Factories;

use App\Models\Category; // <-- Import Category
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str; // <-- Import Str

class ProductFactory extends Factory
{
    public function definition(): array
    {
        $productImages = [
        'products/baju1.jpg',
        'products/baju2.jpg',
        'products/baju3.jpg',
        'products/celana1.jpg',
        'products/celana2.jpg',
        'products/celana3.jpg',
        'products/gadget.jpg',
        'products/gadget2.jpg',
        'products/gadget3.jpg',
        'products/sepatu.jpg',
        'products/sepatu2.jpg',
        'products/sepatu3.jpg',
        'products/tas.jpg',
        'products/tas1.jpg',
        'products/tas2.jpg',
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
            'image_url' => fake()->randomElement($productImages),
        ];
    }
}