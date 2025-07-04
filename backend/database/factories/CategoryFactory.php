<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str; // <-- Import Str

class CategoryFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->words(rand(1, 2), true); // Nama produk dari 2-4 kata

        return [
            'name' => Str::title($name), // Dibuat menjadi Title Case
            'slug' => Str::slug($name), // Slug unik
            'created_at' => now(),
            'updated_at'=> now(),
        ];
    }
}
