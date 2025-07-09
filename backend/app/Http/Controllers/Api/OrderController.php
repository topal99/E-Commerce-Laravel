<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\Coupon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    
 public function store(Request $request)
    {
        $validated = $request->validate([
            'cart' => 'required|array',
            'cart.*.id' => 'required|integer|exists:products,id',
            'cart.*.quantity' => 'required|integer|min:1',
            'shipping_address_id' => 'required|integer|exists:addresses,id,user_id,'.$request->user()->id,
            'shipping_cost' => 'required|numeric|min:0',
            'coupon_code' => 'nullable|string',
        ]);

        $user = $request->user();

        // Gunakan DB::transaction untuk memastikan semua proses berhasil atau gagal bersamaan
        return DB::transaction(function () use ($validated, $user) {
            
            $coupon = null;
            $discountAmount = 0;
            $subtotal = 0;
            $orderItemsData = [];

            // 1. Hitung ulang subtotal di backend
            foreach ($validated['cart'] as $item) {
                $product = Product::find($item['id']);
                if ($product->stock < $item['quantity']) {
                    throw ValidationException::withMessages(['cart' => "Stok untuk produk {$product->name} tidak mencukupi."]);
                }
                $subtotal += $product->price * $item['quantity'];
                $orderItemsData[] = [ 'product_id' => $product->id, 'quantity' => $item['quantity'], 'price' => $product->price ];
            }

            // 2. Validasi Kupon di Backend (hanya jika kode dikirim)
            if (!empty($validated['coupon_code'])) {
                // Kunci kupon untuk mencegah race condition
                $coupon = Coupon::where('code', $validated['coupon_code'])->lockForUpdate()->first();

                // Lakukan semua pengecekan keamanan
                if (!$coupon) throw ValidationException::withMessages(['coupon' => 'Kode kupon tidak valid.']);
                if ($coupon->used_at) throw ValidationException::withMessages(['coupon' => 'Kupon ini sudah pernah digunakan.']);
                if ($coupon->user_id !== null && $coupon->user_id !== $user->id) throw ValidationException::withMessages(['coupon' => 'Anda tidak berhak menggunakan kupon ini.']);
                if ($coupon->expires_at && $coupon->expires_at->isPast()) throw ValidationException::withMessages(['coupon' => 'Kupon sudah kedaluwarsa.']);

                // 3. Hitung ulang diskon di backend
                $discountAmount = $coupon->type === 'fixed' 
                    ? $coupon->value 
                    : ($subtotal * $coupon->value) / 100;
            }

            $totalPrice = $subtotal + $validated['shipping_cost'] - $discountAmount;

            // 4. Buat Pesanan
            $order = $user->orders()->create([
                'shipping_address_id' => $validated['shipping_address_id'],
                'total_price' => max(0, $totalPrice),
                'shipping_cost' => $validated['shipping_cost'],
                'coupon_code' => $coupon ? $coupon->code : null,
                'discount_amount' => $discountAmount,
                'status' => 'paid',
            ]);

            $order->items()->createMany($orderItemsData);

            // 5. Kurangi stok produk
            foreach ($validated['cart'] as $item) {
                Product::find($item['id'])->decrement('stock', $item['quantity']);
            }

            // 6. Tandai kupon sebagai sudah digunakan (jika ada)
            if ($coupon) {
                $coupon->update(['used_at' => now(), 'order_id' => $order->id]);
            }

            // Hapus keranjang
            $user->carts()->delete();

            return response()->json([
                'success' => true,
                'message' => 'Order berhasil dibuat.',
                'data' => $order->load('items.product')
            ], 201);
        });
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
