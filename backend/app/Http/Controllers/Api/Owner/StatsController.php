<?php

namespace App\Http\Controllers\Api\Owner;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class StatsController extends Controller
{
    public function index(Request $request)
    {
        try {
            $owner = $request->user();
            $ownerProductIds = $owner->products()->pluck('id');

            if ($ownerProductIds->isEmpty()) {
                return response()->json($this->getEmptyStats());
            }

            // ## ATURAN 1: Pesanan Baru (status 'paid') - Kode Anda (Sudah Benar) ##
            $newOrdersCount = Order::whereHas('items', fn($q) => $q->whereIn('product_id', $ownerProductIds))
                ->where('status', 'paid') 
                ->count();
            
            // ## ATURAN 2: Total Pendapatan - Kode Anda (Sudah Benar) ##
            $totalRevenue = OrderItem::whereIn('product_id', $ownerProductIds)
                ->where('status', 'delivered') 
                ->sum(DB::raw('quantity * price'));

            // ## ATURAN 3: Produk Terlaris - Kode Anda (Sudah Benar) ##
            $bestSellingProducts = OrderItem::whereIn('product_id', $ownerProductIds)
                ->where('status', 'delivered') 
                ->select('product_id', DB::raw('SUM(quantity) as total_sold'))
                ->groupBy('product_id')
                ->orderByDesc('total_sold')
                ->with('product:id,name,image_url')
                ->limit(5)->get();
            
            // Produk stok rendah (logika tetap sama)
            $lowStockProducts = $owner->products()
                ->where('stock', '<', 10)
                ->orderBy('stock', 'asc')
                ->limit(5)
                ->get();

            // ## KOREKSI HANYA DI SINI - ATURAN 4: Grafik Penjualan ##
            $salesOver7Days = OrderItem::query()
                // 1. Tetap JOIN ke tabel 'orders' untuk mengambil tanggal
                ->join('orders', 'order_items.order_id', '=', 'orders.id')
                ->whereIn('order_items.product_id', $ownerProductIds)
                // 2. Gunakan 'status' dari 'order_items' (sesuai logika Anda yang lain)
                ->where('order_items.status', 'delivered') 
                // 3. Filter tanggal berdasarkan 'created_at' dari tabel 'orders'
                ->where('orders.created_at', '>=', Carbon::now()->subDays(7))
                ->select(
                    DB::raw('DATE(orders.created_at) as date'),
                    DB::raw('SUM(order_items.quantity * order_items.price) as total_sales')
                )
                ->groupBy(DB::raw('DATE(orders.created_at)'))
                ->orderBy(DB::raw('DATE(orders.created_at)'), 'asc')
                ->get()
                ->map(fn($item) => [
                    'date' => Carbon::parse($item->date)->format('d M'),
                    'total_sales' => (float) $item->total_sales
                ]);

            // Produk Terjual - Kode Anda (Sudah Benar)
            $productsSold = OrderItem::whereIn('product_id', $ownerProductIds)
                ->where('status', 'delivered') 
                ->sum('quantity'); // Anda menggunakan DB::raw('quantity') di file, tapi sum('quantity') lebih umum

            return response()->json([
                'data' => [
                    'total_revenue' => (float) $totalRevenue,
                    'products_sold' => (int) $productsSold,
                    'new_orders_count' => $newOrdersCount,
                    'best_selling_products' => $bestSellingProducts,
                    'low_stock_products' => $lowStockProducts,
                    'sales_over_7_days' => $salesOver7Days,
                ]
            ]);

        } catch (\Throwable $th) {
            \Log::error('Error fetching owner stats: ' . $th->getMessage() . ' in ' . $th->getFile() . ' on line ' . $th->getLine());
            return response()->json(['message' => 'Gagal memuat statistik server.'], 500);
        }
    }

    protected function getEmptyStats()
    {
        return [ 'data' => [ 'total_revenue' => 0, 'products_sold' => 0, 'new_orders_count' => 0, 'best_selling_products' => [], 'low_stock_products' => [], 'sales_over_7_days' => [], ] ];
    }
    
    public function latestReviews(Request $request)
    {
        $owner = $request->user();
        $ownerProductIds = $owner->products()->pluck('id');
        $reviews = Review::whereIn('product_id', $ownerProductIds)->with(['product:id,name', 'user:id,name'])->latest()->limit(5)->get();
        return response()->json(['data' => $reviews]);
    }
}