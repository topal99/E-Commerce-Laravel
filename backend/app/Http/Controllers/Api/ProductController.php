<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // PERBAIKAN: Ubah .get() menjadi .paginate()
        // Kita akan menampilkan 12 produk per halaman.
        $products = Product::with('category')
                           ->withCount('reviews')
                           ->withAvg('reviews', 'rating')
                           ->latest() // Tetap urutkan dari yang terbaru
                           ->paginate(12); // <-- KUNCI PERUBAHANNYA

        return response()->json($products); // Langsung kirim hasil paginasi
    }

    /**
     * Store a newly created resource in storage.
     */
// app/Http/Controllers/Api/ProductController.php

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255|unique:products',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'category_id' => 'required|integer|exists:categories,id',
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048', // Validasi untuk gambar
        ]);

        // Proses upload gambar
        if ($request->hasFile('image')) {
            // Simpan gambar ke storage/app/public/products dan dapatkan path-nya
            $path = $request->file('image')->store('products', 'public');
            $validatedData['image_url'] = $path;
        }

        $validatedData['user_id'] = $request->user()->id;
        $validatedData['slug'] = Str::slug($validatedData['name']) . '-' . time();

        $product = Product::create($validatedData);

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
        $product->load('category')
                ->loadCount('reviews')
                ->loadAvg('reviews', 'rating');

        return response()->json([
            'success' => true,
            'message' => 'Product Detail',
            'data'    => $product
        ], 200);
    }
    
    // ... (Method update, destroy, dan myProducts Anda) ...

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

}
