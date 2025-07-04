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
      
      <div className="space-y-4">
        {orders.length > 0 ? orders.map((order) => {
          const representativeStatus = order.items[0]?.status || 'processing';
          const totalItems = order.items.reduce((acc, item) => acc + item.quantity, 0);
          const totalPrice = order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

          return (
            // Setiap kartu pesanan sekarang adalah sebuah Link
            <Link href={`/my-orders/${order.id}`} key={order.id}>
              <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div>
                    <p className="font-bold text-lg">Order #{order.id}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                    <p className="text-sm text-gray-500">{totalItems} produk</p>
                  </div>
                  <div className="text-left sm:text-right mt-2 sm:mt-0">
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="font-semibold text-lg">Rp {new Intl.NumberFormat('id-ID').format(totalPrice)}</p>
                  </div>
                  <div className="mt-2 sm:mt-0">
                    <Badge className={cn("capitalize", statusStyles[representativeStatus])}>
                      {representativeStatus}
                    </Badge>
                  </div>
                </div>
              </div>
            </Link>
          )
        }) : <p>Anda belum memiliki riwayat pesanan.</p>}
      </div>
    </div>
  );
}
