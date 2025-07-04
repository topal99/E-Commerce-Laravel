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
        $validated = $request->validate([
            'cart' => 'required|array',
            'cart.*.id' => 'required|integer|exists:products,id',
            'cart.*.quantity' => 'required|integer|min:1',
        ]);

        DB::beginTransaction();
        try {
            $user = $request->user();
            $totalPrice = 0;
            $orderItemsData = [];

            // Loop untuk validasi stok dan persiapan data
            foreach ($validated['cart'] as $item) {
                $product = Product::find($item['id']);
                
                // Keamanan tambahan: Cek stok sebelum proses
                if ($product->stock < $item['quantity']) {
                    throw new \Exception("Stok untuk produk {$product->name} tidak mencukupi.");
                }

                $totalPrice += $product->price * $item['quantity'];
                $orderItemsData[] = [
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'price' => $product->price,
                ];
            }

            // Buat record order utama
            $order = $user->orders()->create([
                'total_price' => $totalPrice,
                'status' => 'paid', // Langsung dianggap lunas untuk saat ini
            ]);

            // Buat record untuk semua item di dalam order
            $order->items()->createMany($orderItemsData);

            // Loop kedua untuk mengurangi stok setelah order berhasil dibuat
            foreach ($validated['cart'] as $item) {
                Product::find($item['id'])->decrement('stock', $item['quantity']);
            }

            // Hapus keranjang pengguna setelah checkout berhasil
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
}
