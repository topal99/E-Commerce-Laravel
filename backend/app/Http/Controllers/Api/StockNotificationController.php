<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class StockNotificationController extends Controller
{
    /**
     * Mendaftarkan pengguna untuk menerima notifikasi stok kembali.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Product  $product
     * @return \Illuminate\Http\JsonResponse
     */
    public function subscribe(Request $request, Product $product)
    {
        $user = $request->user();

        // 1. Validasi: Pastikan produk yang diminta memang sedang habis.
        if ($product->stock > 0) {
            return response()->json(['message' => 'Produk ini masih tersedia.'], 422); // 422 Unprocessable Entity
        }

        // 2. Gunakan firstOrCreate untuk efisiensi dan mencegah duplikasi.
        // Ini akan mencari pendaftaran yang cocok, jika tidak ada, ia akan membuatnya.
        $notification = $user->stockNotifications()->firstOrCreate(
            [
                'product_id' => $product->id, // Kunci untuk mencari
            ],
            [
                'notified' => false // Nilai default jika membuat baru
            ]
        );

        // 3. Logika untuk mendaftar ulang.
        // Jika pendaftaran sudah ada (bukan baru dibuat) dan statusnya sudah pernah dinotifikasi,
        // kita reset status 'notified' menjadi false agar mereka bisa mendapat email lagi.
        if (!$notification->wasRecentlyCreated && $notification->notified) {
            $notification->update(['notified' => false]);
        }

        // 4. Kirim respons sukses ke frontend.
        return response()->json([
            'success' => true,
            'message' => 'Terima kasih! Anda akan kami beri tahu saat stok produk kembali tersedia.',
        ], 201); // 201 Created
    }
}
