'use client';

import { useEffect, useState, useCallback } from 'react';
import Cookies from 'js-cookie';
import toast, { Toaster } from 'react-hot-toast';
import { Badge } from '@/components/ui/badge';
import { type Product } from '@/lib/types';
import OrderStatusProgress from '@/components/OrderStatusProgress'; // Import komponen progress bar
import { cn } from '@/lib/utils';
import Link from 'next/link';

// Definisikan tipe data yang diterima dari API
interface OrderItem {
  id: number;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  tracking_number: string | null;
  product: Product;
  quantity: number;
  price: number;

}
interface Order {
  id: number;
  created_at: string;
  items: OrderItem[];
}

// Objek untuk memetakan status ke gaya warna badge
const statusStyles: { [key: string]: string } = {
  processing: "bg-yellow-100 text-yellow-800 border-yellow-200",
  shipped: "bg-blue-100 text-blue-800 border-blue-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fungsi untuk mengambil data riwayat pesanan
  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    const token = Cookies.get('auth_token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    try {
      const res = await fetch(`${apiUrl}/api/orders/history`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      });
      if (!res.ok) throw new Error("Gagal memuat riwayat pesanan.");
      const data = await res.json();
      setOrders(data.data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);
  
  if (isLoading) return <div className="p-8 text-center">Memuat riwayat pesanan Anda...</div>;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Toaster />
      <h1 className="text-3xl font-bold mb-6">Pesanan Saya</h1>
      
      <div className="space-y-6">
        {orders.length > 0 ? orders.map((order) => {
          // Ambil status dan nomor resi dari item pertama sebagai representasi
          const representativeItem = order.items[0];
          const representativeStatus = representativeItem?.status || 'processing';
          const trackingNumber = representativeItem?.tracking_number;
          const subtotalForOwner = order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

          return (
            <div key={order.id} className="bg-white p-6 rounded-lg shadow-md">
              {/* Header Kartu Pesanan */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <div>
                  <span className="text-sm text-gray-500">Order ID: #{order.id}</span>
                  <p className="font-semibold text-lg">Tanggal: {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                {/* Tampilkan Badge Status Utama di sini */}
                <Badge className={cn("mt-2 sm:mt-0 capitalize", statusStyles[representativeStatus])}>
                  {representativeStatus}
                </Badge>
                
                {trackingNumber && (
                <div className="pt-4 mb-4">
                  <p className="text-sm font-semibold text-gray-700">Nomor Resi Pengiriman:</p>
                  <Badge variant="outline" className="text-base mt-1">{trackingNumber}</Badge>
                </div>
              )}

              </div>

              {/* Progress Bar untuk seluruh pesanan */}
              <div className="mb-6">
                <OrderStatusProgress status={representativeStatus} />
              </div>

              {/* PERBAIKAN: Tampilkan Nomor Resi di level pesanan, jika ada */}

              {/* Rincian Item di dalam Pesanan */}
              <div className="space-y-4 border-t pt-4">
                {order.items.map(item => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${item.product.image_url}`} alt={item.product.name} className="w-16 h-16 rounded object-cover"/>
                      <div>
                        <p className="font-semibold">{item.product.name}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-4 mb-4">
                <p className="font-semibold text-lg pt-4 text-right">Total Pembayaran: Rp {new Intl.NumberFormat('id-ID').format(subtotalForOwner)}</p>
                </div>
            </div>
          )
        }) : (
          <div className="text-center p-12 border rounded-lg bg-white">
            <p className="text-lg">Anda belum memiliki riwayat pesanan.</p>
            <Link href="/" className="text-blue-500 hover:underline mt-2 inline-block">Mulai Belanja</Link>
          </div>
        )}
      </div>
    </div>
  );
}
