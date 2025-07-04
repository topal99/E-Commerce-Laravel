<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * Mengambil daftar semua kategori.
     * INI ADALAH METHOD BARU YANG KITA BUTUHKAN.
     */
    public function index()
    {
        // Ambil semua data dari tabel kategori
        $categories = Category::all();
        return response()->json(['data' => $categories]);
    }

    /**
     * Menampilkan detail satu kategori beserta semua produk di dalamnya.
     */
    public function show(Category $category)
    {
        $category->load(['products' => function ($query) {
            $query->withCount('reviews')->withAvg('reviews', 'rating')->with('category');
        }]);

        return response()->json([
            'success' => true,
            'data' => $category
        ]);
    }
}
