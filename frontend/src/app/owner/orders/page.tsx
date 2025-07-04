'use client';

import { useEffect, useState, useCallback } from 'react';
import Cookies from 'js-cookie';
import toast, { Toaster } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import UpdateOrderForm from '@/components/owner/UpdateOrderForm';
import { Badge } from '@/components/ui/badge';
import { type Product } from '@/lib/types';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { MapPin, Tag } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

// Definisikan tipe data yang diterima dari API
interface Address {
  id: number;
  label: string;
  recipient_name: string;
  phone_number: string;
  full_address: string;
  city: string;
  province: string;
  postal_code: string;
}

interface OrderItem {
  id: number;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  tracking_number: string | null;
  product: Product;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  created_at: string;
  user: { name: string; };
  items: OrderItem[];
  shipping_address: Address | null;
  shipping_cost: number;
  total_price: number;
  coupon_code: string | null;
  discount_amount: number;
}

// Objek untuk memetakan status ke gaya warna badge
const statusStyles: { [key: string]: string } = {
  processing: "bg-yellow-100 text-yellow-800 border-yellow-200",
  shipped: "bg-blue-100 text-blue-800 border-blue-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};


export default function OwnerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Fungsi untuk mengambil data pesanan dari backend
  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    const token = Cookies.get('auth_token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    try {
      const res = await fetch(`${apiUrl}/api/owner/orders`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      });
      if (!res.ok) throw new Error("Gagal memuat pesanan.");
      const data = await res.json();
      setOrders(data.data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleOpenUpdateModal = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };
  
  if (isLoading) return <div className="p-8 text-center">Memuat pesanan masuk...</div>;
          
  return (
    <div className="container mx-auto p-4 md:p-8">
      <Toaster />
      <h1 className="text-3xl font-bold mb-6">Manajemen Pesanan</h1>
      
      <div className="space-y-6">
        {orders.length > 0 ? orders.map((order) => {
          // Kalkulasi subtotal hanya untuk produk milik owner di pesanan ini
          const subtotalForOwner = order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
          const representativeStatus = order.items[0]?.status || 'processing';

          
          return (
            <div key={order.id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 border-b pb-4">
                <div>
                  <span className="text-sm text-gray-500">Order ID: #{order.id}</span>
                  <p className="font-semibold text-lg">Pemesan: {order.user.name}</p>
                  <Badge className={cn("mt-2 capitalize", statusStyles[representativeStatus])}>
                    {representativeStatus}
                  </Badge>

                </div>
                <div className="text-left sm:text-right mt-2 sm:mt-0">
                  <p className="text-sm text-gray-500">
                    Tanggal: {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    <div className="flex justify-end pt-4">
                      <Button size="sm" variant="ghost-dark" className='outline' onClick={() => handleOpenUpdateModal(order)}>Update Status & Resi</Button>
                    </div>

                </div>
              </div>
              
              {/* Rincian item di dalam pesanan */}
              <div className="space-y-2 pt-4">
                <p className="text-sm font-medium text-gray-500">Detail Produk:</p>
                {order.items.map(item => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Image className="w-12 h-12 rounded object-cover" src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${item.product.image_url}`} 
                        alt={item.product.name} width={400} height={400}
                      />
                      <div>
                        <p className="font-semibold">{item.product.name}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* PERBAIKAN 2: Bagian Baru untuk Rincian Biaya Pesanan */}
              <div className="mt-4 pt-4">
                {/* <h4 className="text-md font-semibold mb-2">Rincian Biaya Keseluruhan</h4> */}
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <p className="text-muted-foreground">Subtotal Produk (milik Anda)</p>
                    <p>Rp {new Intl.NumberFormat('id-ID').format(subtotalForOwner)}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-muted-foreground">Ongkos Kirim</p>
                    <p>Rp {new Intl.NumberFormat('id-ID').format(order.shipping_cost)}</p>
                  </div>
                  {order.discount_amount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <p className="flex items-center gap-1"><Tag className="w-4 h-4"/> Diskon ({order.coupon_code})</p>
                      <p>- Rp {new Intl.NumberFormat('id-ID').format(order.discount_amount)}</p>
                    </div>
                  )}
                   <Separator className="my-2" />
                   <div className="flex justify-between font-bold">
                      <p>Total Dibayar Pelanggan</p>
                      <p>Rp {new Intl.NumberFormat('id-ID').format(order.total_price)}</p>
                   </div>
                </div>
              </div>
            </div>
          )
        }) : <p>Belum ada pesanan masuk.</p>}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Update Pesanan #{selectedOrder?.id}</DialogTitle></DialogHeader>
          {selectedOrder && (
            <UpdateOrderForm
              order={selectedOrder}
              onSaved={() => {
                setIsModalOpen(false);
                fetchOrders(); // Muat ulang data setelah update
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
