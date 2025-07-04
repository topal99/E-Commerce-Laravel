<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Wishlist; // <-- Pastikan use statement ini ada

class WishlistController extends Controller
{
    /**
     * Mengambil daftar ID produk yang ada di wishlist user.
     */
    public function index(Request $request)
    {
        // Ambil semua item wishlist milik user yang sedang login,
        // lalu ambil hanya kolom 'product_id'-nya saja.
        $wishlistProductIds = $request->user()->wishlistItems()->pluck('product_id');

        return response()->json(['data' => $wishlistProductIds]);
    }

    /**
     * Menambah atau menghapus produk dari wishlist.
     */
    public function toggle(Request $request)
    {
        $request->validate(['product_id' => 'required|exists:products,id']);
        
        $user = $request->user();
        $productId = $request->product_id;

        // Cari dulu apakah item ini sudah ada di wishlist user.
        $wishlistItem = $user->wishlistItems()->where('product_id', $productId)->first();

        // Jika SUDAH ADA, maka kita hapus.
        if ($wishlistItem) {
            $wishlistItem->delete();
            return response()->json(['message' => 'Removed from wishlist', 'status' => 'removed']);
        } 
        
        // Jika BELUM ADA, maka kita buat record baru.
        else {
            $user->wishlistItems()->create([
                'product_id' => $productId
            ]);
            return response()->json(['message' => 'Added to wishlist', 'status' => 'added']);
        }
    }
}
