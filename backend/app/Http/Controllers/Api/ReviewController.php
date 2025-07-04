<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /**
     * Menyimpan ulasan baru untuk sebuah produk.
     */
    public function store(Request $request, Product $product)
    {
        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $user = $request->user();

        // Pengecekan 1: Apakah pengguna pernah membeli produk ini?
        $hasPurchased = $user->orders()
            ->where('status', 'paid')
            ->whereHas('items', function ($query) use ($product) {
                $query->where('product_id', $product->id);
            })
            ->exists();

        if (!$hasPurchased) {
            return response()->json(['message' => 'Anda hanya bisa mengulas produk yang sudah Anda beli.'], 403);
        }

        // Pengecekan 2: Apakah pengguna sudah pernah memberikan ulasan untuk produk ini?
        $hasReviewed = $product->reviews()->where('user_id', $user->id)->exists();

        if ($hasReviewed) {
            return response()->json(['message' => 'Anda sudah pernah memberikan ulasan untuk produk ini.'], 403);
        }

        // Jika semua pengecekan lolos, buat ulasan baru.
        $product->reviews()->create([
            'user_id' => $user->id,
            'rating' => $validated['rating'],
            'comment' => $validated['comment'] ?? null,
        ]);

        // PERBAIKAN UTAMA: Muat ulang seluruh data produk dengan relasi terbaru
        $updatedProduct = $product->fresh()->load([
            'category', 
            'reviews' => function ($query) {
                $query->with('user:id,name')->latest();
            }
        ])->loadCount('reviews')->loadAvg('reviews', 'rating');

        return response()->json([
            'success' => true,
            'message' => 'Ulasan berhasil disimpan!',
            'data' => $updatedProduct, // Kirim kembali seluruh objek produk yang sudah diperbarui
        ], 201);
    }
}
