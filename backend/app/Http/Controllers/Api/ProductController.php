<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Log;
use App\Events\ProductRestocked;
use Illuminate\Support\Facades\DB; 

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Mulai query builder
        $query = Product::with('category')
                        ->withCount('reviews')
                        ->withAvg('reviews', 'rating');

        // 1. Logika Filter Harga
        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }
        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }

        // 2. Logika Sorting (Mengurutkan)
        if ($request->has('sort')) {
            switch ($request->sort) {
                case 'price_asc':
                    $query->orderBy('price', 'asc');
                    break;
                case 'price_desc':
                    $query->orderBy('price', 'desc');
                    break;
                case 'latest':
                    $query->latest();
                    break;
                case 'rating':
                    // Urutkan berdasarkan rating rata-rata, dari tertinggi
                    $query->orderByDesc('reviews_avg_rating');
                    break;
            }
        } else {
            // Urutan default jika tidak ada parameter sort
            $query->latest();
        }

        // 3. Paginasi
        $products = $query->paginate(12);

        return response()->json($products);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255|unique:products',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'category_id' => 'required|integer|exists:categories,id',
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048', 
            'gallery_images' => 'nullable|array',
            'gallery_images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:2048'        
         ]);

        $path = $request->file('image')->store('products', 'public');
        $validatedData['image_url'] = $path;

        $validatedData['user_id'] = $request->user()->id;
        $validatedData['slug'] = Str::slug($validatedData['name']) . '-' . time();

        $product = Product::create($validatedData);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $validatedData['image_url'] = $path;
        }

        if ($request->hasFile('gallery_images')) {
            foreach ($request->file('gallery_images') as $galleryImage) {
                $galleryPath = $galleryImage->store('products', 'public');
                // Buat record baru di tabel product_images
                $product->images()->create(['image_url' => $galleryPath]);
            }
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Product created successfully',
            'data' => $product,
        ], 201);
    }
    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        // Method show() Anda sudah benar
        $product->load([
                    'category', 
                    'reviews.user',
                    'questions.user',
                    'questions.answer.user',
                    'user:id,name,slug',
                    'images',
                ])                
                ->loadCount('reviews')
                ->loadAvg('reviews', 'rating');

        return response()->json([
            'success' => true,
            'message' => 'Product Detail',
            'data'    => $product
        ], 200);
    }
    
// Versi BARU & BENAR
    public function myProducts(Request $request) { 
        // Tambahkan ->with('category') untuk menyertakan detail kategori
        $products = $request->user()->products()->with('category')->latest()->get();
        return response()->json(['data' => $products]);
    }
    
    public function getByIds(Request $request)
    {
        // Validasi bahwa 'ids' dikirim dan harus berupa array
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:products,id' // Validasi setiap ID di dalam array
        ]);

        $productIds = $request->ids;

        // Ambil produk menggunakan 'whereIn' yang sangat efisien
        $products = Product::whereIn('id', $productIds)
                        ->with('category') // Sertakan juga semua data tambahan
                        ->withCount('reviews')
                        ->withAvg('reviews', 'rating')
                        ->get();

        return response()->json(['data' => $products]);
    }

    public function update(Request $request, Product $product)
    {
        $oldStock = $product->stock;

        // Otorisasi: Pastikan hanya pemilik produk yang bisa mengeditnya.
        if ($request->user()->id !== $product->user_id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validatedData = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('products')->ignore($product->id)],
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'category_id' => 'required|integer|exists:categories,id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048', // Gambar bersifat opsional saat update
        ]);

        // Proses jika ada gambar baru yang di-upload
        if ($request->hasFile('image')) {
            // Hapus gambar lama jika ada
            if ($product->image_url) {
                \Storage::disk('public')->delete($product->image_url);
            }
            // Simpan gambar baru dan update path-nya
            $path = $request->file('image')->store('products', 'public');
            $validatedData['image_url'] = $path;
        }

        // Jika nama produk diubah, buat slug baru yang unik.
        if ($request->has('name') && $request->name !== $product->name) {
            $validatedData['slug'] = Str::slug($request->name) . '-' . time();
        }

        // LANGKAH 3: Update data di database
        $product->update($validatedData);

        // 2. Logika untuk memicu event
        Log::info("Mencoba memicu event restock. Stok Lama: {$oldStock}, Stok Baru: {$product->stock}");

        if ($oldStock <= 0 && $product->stock > 0) {
            Log::info("Kondisi terpenuhi! Memicu event ProductRestocked untuk produk ID: {$product->id}");
            ProductRestocked::dispatch($product);
        }

        // LANGKAH 4: Kirim response sukses dengan data yang sudah diupdate
        return response()->json([
            'success' => true,
            'message' => 'Product updated successfully',
            'data' => $product,
        ]);

    }
    
    public function destroy(Request $request, Product $product)
    {
        // Otorisasi: pastikan hanya pemilik produk yang bisa menghapus.
        if ($request->user()->id !== $product->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Hapus produk
        $product->delete();

        return response()->json(['message' => 'Product deleted successfully.']);
    }

    public function search(Request $request)
    {
        // Ambil kata kunci pencarian dari URL (?q=...)
        $query = $request->query('q');

        // Jika tidak ada query, kembalikan array kosong
        if (!$query) {
            return response()->json(['data' => []]);
        }

        // Cari produk yang namanya (name) ATAU deskripsinya (description)
        // cocok dengan query yang diberikan.
        $products = Product::where('name', 'LIKE', "%{$query}%")
                           ->orWhere('description', 'LIKE', "%{$query}%")
                           ->with('category') // Sertakan data tambahan
                           ->withCount('reviews')
                           ->withAvg('reviews', 'rating')
                           ->take(20) // Batasi hasil pencarian agar tidak terlalu banyak
                           ->get();
        
        return response()->json(['data' => $products]);
    }

    public function getRecommendations(Request $request, Product $product)
    {
        // Ambil produk dari kategori yang sama dengan produk saat ini
        $recommendations = Product::where('category_id', $product->category_id)
                                  // Kecualikan produk saat ini dari hasil
                                  ->where('id', '!=', $product->id)
                                  // Ambil secara acak
                                  ->inRandomOrder()
                                  // Batasi hanya 4 produk
                                  ->limit(4)
                                  // Sertakan juga data tambahan untuk ditampilkan di kartu produk
                                  ->with('category')
                                  ->withCount('reviews')
                                  ->withAvg('reviews', 'rating')
                                  ->get();
        
        return response()->json(['data' => $recommendations]);
    }
    
    public function autocomplete(Request $request)
    {
        $validated = $request->validate(['q' => 'required|string']);
        $query = $validated['q'];

        // Membuat pencarian menjadi case-insensitive (tidak peduli huruf besar/kecil).
        $suggestions = Product::where(DB::raw('LOWER(name)'), 'LIKE', '%' . strtolower($query) . '%')
                              ->select('name', 'slug')
                              ->limit(7)
                              ->get();
        
        return response()->json(['data' => $suggestions]);
    }

}
