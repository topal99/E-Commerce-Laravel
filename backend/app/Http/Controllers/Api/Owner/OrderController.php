<?php

namespace App\Http\Controllers\Api\Owner;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    /**
     * Mengambil semua pesanan yang relevan untuk pemilik toko.
     * LOGIKA BARU: Mengambil Order, bukan OrderItem.
     */
    public function index(Request $request)
    {
        $owner = $request->user();
        // 1. Dapatkan semua ID produk milik owner ini
        $ownerProductIds = $owner->products()->pluck('id');

        // 2. Cari semua 'Order' yang memiliki 'items' dengan product_id tersebut
        $orders = Order::whereHas('items', function($query) use ($ownerProductIds) {
            $query->whereIn('product_id', $ownerProductIds);
        })
        ->with([
            'user:id,name', // Ambil data pemesan (hanya id dan nama)
            // Ambil HANYA item yang relevan untuk owner ini, beserta detail produknya
            'items' => function($query) use ($ownerProductIds) {
                $query->whereIn('product_id', $ownerProductIds)->with('product');
            },
            'shippingAddress' 

        ])
        ->latest() // Urutkan dari pesanan terbaru
        ->get();

        return response()->json(['data' => $orders]);
    }

    /**
     * Mengupdate SEMUA item milik owner di dalam satu pesanan.
     * LOGIKA BARU: Menerima Order, bukan OrderItem tunggal.
     */
    public function updateItemsStatus(Request $request, Order $order)
    {
        $owner = $request->user();

        $validated = $request->validate([
            'status' => 'required|in:processing,shipped,delivered,cancelled',
            'tracking_number' => 'nullable|string|max:255',
        ]);

        // Dapatkan semua ID produk milik owner
        $ownerProductIds = $owner->products()->pluck('id');

        // Update semua item di dalam pesanan ini yang produknya milik owner
        $order->items()
              ->whereIn('product_id', $ownerProductIds)
              ->update([
                  'status' => $validated['status'],
                  'tracking_number' => $validated['tracking_number'] ?? null,
              ]);

        return response()->json([
            'success' => true,
            'message' => 'Status pesanan berhasil diperbarui.',
        ]);
    }
}
