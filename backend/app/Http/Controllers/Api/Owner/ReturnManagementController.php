<?php

namespace App\Http\Controllers\Api\Owner;

use App\Http\Controllers\Controller;
use App\Models\ReturnRequest;
use Illuminate\Http\Request;

class ReturnManagementController extends Controller
{
    /**
     * Mengambil semua permintaan pengembalian untuk produk milik owner.
     */
    public function index(Request $request)
    {
        $owner = $request->user();
        $ownerProductIds = $owner->products()->pluck('id');

        // Ambil semua permintaan pengembalian yang itemnya milik owner
        $returnRequests = ReturnRequest::whereHas('orderItem.product', function ($query) use ($ownerProductIds) {
            $query->whereIn('id', $ownerProductIds);
        })
        ->with([
            'user:id,name', // Pengguna yang mengajukan
            'orderItem.product:id,name,image_url' // Produk yang dikembalikan
        ])
        ->latest()
        ->get();

        return response()->json(['data' => $returnRequests]);
    }

    /**
     * Mengupdate status permintaan pengembalian (Approve/Reject).
     */
    public function update(Request $request, ReturnRequest $returnRequest)
    {
        // Otorisasi: Pastikan owner hanya bisa update permintaan untuk produknya
        if ($request->user()->id !== $returnRequest->orderItem->product->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'status' => 'required|in:approved,rejected',
        ]);

        $returnRequest->update(['status' => $validated['status']]);

        // TODO: Tambahkan logika selanjutnya, seperti notifikasi ke pelanggan
        // atau proses pengembalian dana jika disetujui.

        return response()->json([
            'success' => true,
            'message' => 'Status permintaan pengembalian berhasil diperbarui.',
            'data' => $returnRequest,
        ]);
    }
}
