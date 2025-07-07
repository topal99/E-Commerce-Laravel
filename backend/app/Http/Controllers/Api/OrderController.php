<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    
    public function store(Request $request)
    {
        // PERBAIKAN 1: Tambahkan validasi untuk data kupon (bersifat opsional)
        $validated = $request->validate([
            'cart' => 'required|array',
            'cart.*.id' => 'required|integer|exists:products,id',
            'cart.*.quantity' => 'required|integer|min:1',
            'shipping_address_id' => 'required|integer|exists:addresses,id,user_id,'.$request->user()->id,
            'shipping_cost' => 'required|numeric|min:0',
            'coupon_code' => 'nullable|string',
            'discount_amount' => 'nullable|numeric|min:0',
        ]);

        DB::beginTransaction();
        try {
            $user = $request->user();
            $subtotal = 0;
            $orderItemsData = [];

            foreach ($validated['cart'] as $item) {
                $product = Product::find($item['id']);
                if ($product->stock < $item['quantity']) {
                    throw new \Exception("Stok untuk produk {$product->name} tidak mencukupi.");
                }
                $subtotal += $product->price * $item['quantity'];
                $orderItemsData[] = [ 'product_id' => $product->id, 'quantity' => $item['quantity'], 'price' => $product->price ];
            }

            // PERBAIKAN 2: Hitung total akhir dengan diskon
            $totalPrice = $subtotal + $validated['shipping_cost'] - ($validated['discount_amount'] ?? 0);

            // PERBAIKAN 3: Simpan informasi kupon dan diskon ke database
            $order = $user->orders()->create([
                'shipping_address_id' => $validated['shipping_address_id'],
                'total_price' => max(0, $totalPrice), // Pastikan total tidak negatif
                'shipping_cost' => $validated['shipping_cost'],
                'coupon_code' => $validated['coupon_code'] ?? null,
                'discount_amount' => $validated['discount_amount'] ?? 0,
                'status' => 'paid',
            ]);

            $order->items()->createMany($orderItemsData);

            foreach ($validated['cart'] as $item) {
                Product::find($item['id'])->decrement('stock', $item['quantity']);
            }

            $user->carts()->delete();
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Order berhasil dibuat.',
                'data' => $order->load('items.product')
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal membuat pesanan.', 'error' => $e->getMessage()], 500);
        }
    }
    
    public function history(Request $request)
    {
        $user = $request->user();
        $orders = $user->orders()->with('items.product')->latest()->get();
        return response()->json([
            'success' => true,
            'message' => 'Riwayat pesanan berhasil diambil',
            'data' => $orders,
        ]);
    }

    public function show(Request $request, Order $order)
    {
        // Otorisasi: Pastikan pengguna hanya bisa melihat pesanannya sendiri.
        if ($request->user()->id !== $order->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Muat semua relasi yang dibutuhkan oleh halaman detail
        $order->load(['items.product', 'items.returnRequest', 'shippingAddress']);

        return response()->json(['data' => $order]);
    }

    /**
     * Membatalkan sebuah pesanan (jika statusnya masih 'processing').
     */
    public function cancel(Request $request, Order $order)
    {
        // Otorisasi
        if ($request->user()->id !== $order->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Logika Bisnis: Hanya bisa dibatalkan jika masih diproses
        // Kita cek status dari item pertama sebagai representasi
        if ($order->items()->first()->status !== 'processing') {
            return response()->json(['message' => 'Pesanan ini tidak dapat dibatalkan lagi.'], 422);
        }

        // Kembalikan stok produk
        foreach ($order->items as $item) {
            Product::find($item->product_id)->increment('stock', $item->quantity);
        }

        // Ubah status semua item menjadi 'cancelled'
        $order->items()->update(['status' => 'cancelled']);

        return response()->json(['message' => 'Pesanan berhasil dibatalkan.']);
    }

}
