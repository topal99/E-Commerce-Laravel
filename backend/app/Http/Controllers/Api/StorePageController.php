<?php

namespace App\Http\Controllers\Api;

    use App\Http\Controllers\Controller;
    use App\Models\User;
    use Illuminate\Http\Request;
    use Illuminate\Support\Facades\DB;

    class StorePageController extends Controller
    {
        public function show(Request $request, User $user)
        {
            // Pastikan user yang diakses adalah store_owner
            if ($user->role !== 'store_owner') {
                return response()->json(['message' => 'Toko tidak ditemukan.'], 404);
            }

            // Ambil produk milik owner ini, dengan paginasi dan pencarian
            $productsQuery = $user->products()
                                  ->with('category')
                                  ->withCount('reviews')
                                  ->withAvg('reviews', 'rating');

            if ($request->has('q')) {
                $productsQuery->where('name', 'LIKE', '%' . $request->q . '%');
            }

            $products = $productsQuery->latest()->paginate(8);

            // Hitung statistik toko
            $stats = [
                'total_products' => $user->products()->count(),
                'total_sales' => DB::table('order_items')
                                    ->whereIn('product_id', $user->products()->pluck('id'))
                                    ->sum('quantity'),
                'average_rating' => round($user->products()->withAvg('reviews', 'rating')->get()->avg('reviews_avg_rating'), 1)
            ];

            return response()->json([
                'store' => [
                    'name' => $user->name,
                    'bio' => $user->bio,
                    'stats' => $stats
                ],
                'products' => $products,
            ]);
        }
    }