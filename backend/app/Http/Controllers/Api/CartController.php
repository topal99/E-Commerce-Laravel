<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB; // <-- PERBAIKAN UTAMA: Import DB Facade
use App\Models\Product; // <-- Import Product
use App\Models\Cart;

class CartController extends Controller
{
    // Mendapatkan semua isi keranjang milik user
    public function index(Request $request)
    {
        $cartItems = $request->user()->carts()
            // PERBAIKAN: Muat relasi produk DAN user (pemilik toko) dari produk tersebut
            ->with(['product.user:id,name,slug']) 
            ->get();
            
        return response()->json(['data' => $cartItems]);
    }    
    
    // Menambahkan produk ke keranjang
    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'sometimes|integer|min:1'
        ]);
        
        $user = $request->user();
        $productId = $validated['product_id'];
        $quantityToAdd = $validated['quantity'] ?? 1;

        $product = Product::find($productId);

        DB::beginTransaction();
        try {
            $cartItem = $user->carts()->where('product_id', $productId)->first();
            
            // Hitung total kuantitas yang akan ada di keranjang
            $currentQuantityInCart = $cartItem ? $cartItem->quantity : 0;
            $newTotalQuantity = $currentQuantityInCart + $quantityToAdd;

            // PERBAIKAN UTAMA: Validasi Stok
            if ($newTotalQuantity > $product->stock) {
                // Jika permintaan melebihi stok, kirim error
                return response()->json(['message' => 'Maaf, stok produk tidak mencukupi.'], 422);
            }

            if ($cartItem) {
                $cartItem->quantity = $newTotalQuantity;
                $cartItem->save();
            } else {
                $cartItem = $user->carts()->create([
                    'product_id' => $productId,
                    'quantity' => $newTotalQuantity
                ]);
            }

            DB::commit();
            $cartItem->load('product');
            return response()->json(['message' => 'Produk ditambahkan ke keranjang.', 'data' => $cartItem], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal menambahkan produk.', 'error' => $e->getMessage()], 500);
        }
    }    

    // Menghapus produk dari keranjang
    public function destroy(Request $request, $productId)
    {
        $request->user()->carts()->where('product_id', $productId)->delete();
        return response()->json(['message' => 'Product removed from cart.']);
    }

    // Mengubah jumlah produk di keranjang
    public function update(Request $request, $productId)
    {
        $request->validate(['quantity' => 'required|integer|min:1']);

        $request->user()->carts()->where('product_id', $productId)->update([
            'quantity' => $request->quantity
        ]);

        return response()->json(['message' => 'Cart updated.']);
    }
}