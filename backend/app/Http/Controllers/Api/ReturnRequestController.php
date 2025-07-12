<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Events\ReturnRequested; 

    class ReturnRequestController extends Controller
    {
        /**
         * Pelanggan mengajukan permintaan pengembalian barang.
         */
        public function store(Request $request, OrderItem $orderItem)
        {
            // Otorisasi: Pastikan item ini milik user yang sedang login
            if ($request->user()->id !== $orderItem->order->user_id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            // Validasi: Pastikan item sudah diterima dan belum pernah diajukan return
            if ($orderItem->status !== 'delivered') {
                return response()->json(['message' => 'Hanya produk yang sudah diterima yang bisa diajukan pengembalian.'], 422);
            }
            if ($orderItem->returnRequest) {
                return response()->json(['message' => 'Anda sudah pernah mengajukan pengembalian untuk item ini.'], 422);
            }

            $validated = $request->validate([
                'reason' => 'required|string|min:10|max:1000',
                'image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            ]);

            $path = null;
            if ($request->hasFile('image')) {
                $path = $request->file('image')->store('returns', 'public');
            }

            $returnRequest = $orderItem->returnRequest()->create([
                'user_id' => $request->user()->id,
                'reason' => $validated['reason'],
                'image_url' => $path,
            ]);

            ReturnRequested::dispatch($returnRequest->load(['orderItem.product.user', 'user']));

            return response()->json(['message' => 'Permintaan pengembalian berhasil dikirim.'], 201);
        }
    }
    
