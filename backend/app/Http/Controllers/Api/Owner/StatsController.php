<?php

namespace App\Http\Controllers\Api\Owner;

use App\Http\Controllers\Controller;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StatsController extends Controller
{
    public function index(Request $request)
    {
        $owner = $request->user();
        $ownerProductIds = $owner->products()->pluck('id');

        // ... (Query untuk total_revenue, products_sold, new_orders_count, best_selling_products tetap sama)
        $totalRevenue = OrderItem::whereHas('order', function ($query) { /* ... */ })->whereIn('product_id', $ownerProductIds)->sum(DB::raw('price * quantity'));
        $productsSold = OrderItem::whereHas('order', function ($query) { /* ... */ })->whereIn('product_id', $ownerProductIds)->sum('quantity');
        $newOrdersCount = OrderItem::where('status', 'processing')->whereIn('product_id', $ownerProductIds)->distinct('order_id')->count();
        $bestSellingProducts = OrderItem::whereIn('product_id', $ownerProductIds)->select('product_id', DB::raw('SUM(quantity) as total_sold'))->groupBy('product_id')->orderByDesc('total_sold')->with('product:id,name,image_url')->limit(5)->get();
        
        // ==========================================================
        // QUERY BARU: Mengambil produk dengan stok rendah
        // ==========================================================
        // Kita ambil produk yang stoknya di bawah 10 (tapi lebih dari 0)
        $lowStockProducts = $owner->products()
                                  ->where('stock', '<', 10)
                                  ->where('stock', '>', 0)
                                  ->orderBy('stock', 'asc') // Urutkan dari yang paling sedikit
                                  ->limit(5)
                                  ->get();
        
        return response()->json([
            'data' => [
                'total_revenue' => (float) $totalRevenue,
                'products_sold' => (int) $productsSold,
                'new_orders_count' => $newOrdersCount,
                'best_selling_products' => $bestSellingProducts,
                'low_stock_products' => $lowStockProducts, // <-- Tambahkan data baru ke respons
            ]
        ]);
    }
}
