'use client';

import { useEffect, useState, useCallback } from 'react';
import Cookies from 'js-cookie';
import toast, { Toaster } from 'react-hot-toast';
import { DollarSign, Package, ShoppingCart, AlertTriangle, CheckCircle } from 'lucide-react';
import { type Product } from '@/lib/types'; // Import tipe Product
import Image from 'next/image';
import LatestReviews from '@/components/owner/LatestReviews'; // <- 1. IMPORT KOMPONEN BARU
import SalesChart from '@/components/owner/SalesChart'; // 1. Import SalesChart

// Definisikan tipe data untuk statistik yang akan diterima dari API
interface Stats {
  total_revenue: number;
  products_sold: number;
  new_orders_count: number;
  best_selling_products: any[];
  low_stock_products: Product[];
  sales_over_7_days: { date: string; total_sales: number }[]; // Tambahkan ini
}

// Komponen kecil yang bisa digunakan kembali untuk menampilkan kartu statistik
const StatCard = ({ title, value, icon: Icon }: { title: string, value: string | number, icon: React.ElementType }) => (
  <div className="bg-white p-6 rounded-lg shadow-md flex items-center gap-4">
    <div className="bg-blue-100 p-3 rounded-full">
      <Icon className="w-6 h-6 text-blue-600" />
    </div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
);

export default function OwnerDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fungsi untuk mengambil data statistik dari backend
  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    const token = Cookies.get('auth_token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    try {
      const res = await fetch(`${apiUrl}/api/owner/stats`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      });
      if (!res.ok) throw new Error("Gagal memuat statistik.");
      const data = await res.json();
      setStats(data.data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  if (isLoading) {
    return <div className="p-8 text-center">Memuat dashboard...</div>;
  }

  if (!stats) {
    return <div className="p-8 text-center">Tidak dapat memuat data statistik.</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      <Toaster position="top-center" />
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      {/* Grid untuk Kartu Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Total Pendapatan" value={`Rp ${new Intl.NumberFormat('id-ID').format(stats.total_revenue)}`} icon={DollarSign} />
        <StatCard title="Produk Terjual" value={stats.products_sold} icon={Package} />
        <StatCard title="Pesanan Baru" value={stats.new_orders_count} icon={ShoppingCart} />
      </div>

      {stats.sales_over_7_days && (
          <SalesChart data={stats.sales_over_7_days} />
      )}

      {/* Grid untuk menampung dua widget: Produk Terlaris dan Stok Rendah */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4 mb-8">
        {/* Widget Produk Terlaris */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 pb-4">
            <CheckCircle className="w-6 h-6 text-green-500" />Produk Terjual</h2>
            <ul className="space-y-4">
              {stats.best_selling_products.length > 0 ? stats.best_selling_products.map((item, index) => (
                <li key={item.product_id} className="flex items-center gap-4">
                  <span className="font-bold text-lg text-gray-400">{index + 1}</span>
                  <Image src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${item.product.image_url}`} width={400} height={400} alt={item.product.name} className="w-12 h-12 rounded object-cover"/>
                  <div className="flex-grow">
                    <p className="font-semibold">{item.product.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{item.total_sold}</p>
                    <p className="text-sm text-gray-500">terjual</p>
                  </div>
                </li>
              )) : <p className="text-sm text-gray-500">Belum ada data penjualan.</p>}
            </ul>
          </div>

        {/* Widget Stok Segera Habis */}
          <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 pb-4">
            <AlertTriangle className="w-6 h-6 text-yellow-500" />
            Stok Segera Habis
          </h2>
            <ul className="space-y-4">
              {stats.low_stock_products.length > 0 ? stats.low_stock_products.map((product) => (
                <li key={product.id} className="flex items-center gap-4">
                  <Image src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${product.image_url}`} width={400} height={400} alt={product.name} className="w-12 h-12 rounded object-cover"/>
                  <div className="flex-grow">
                    <p className="font-semibold">{product.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-500 text-xl">{product.stock}</p>
                    <p className="text-sm text-gray-500">tersisa</p>
                  </div>
                </li>
              )) : <p className="text-sm text-gray-500">Semua stok produk Anda aman.</p>}
            </ul>
        </div>
        <LatestReviews />
      </div>
    </div>
  );
}
