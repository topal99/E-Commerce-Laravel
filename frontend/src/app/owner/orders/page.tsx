'use client';

import { useEffect, useState, useCallback } from 'react';
import Cookies from 'js-cookie';
import toast, { Toaster } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import UpdateOrderForm from '@/components/owner/UpdateOrderForm';
import { Badge } from '@/components/ui/badge';
import { type Product } from '@/lib/types';
import { cn } from '@/lib/utils'; // Import cn untuk menggabungkan kelas

// Definisikan tipe data yang diterima dari API
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
          // Hitung subtotal hanya untuk item milik owner di pesanan ini
          const subtotalForOwner = order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
          // Ambil status dari item pertama sebagai representasi status pesanan
          const representativeStatus = order.items[0]?.status || 'processing';
          
          return (
            <div key={order.id} className="bg-white p-6 rounded-lg shadow-md">

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 pb-4">
                
                <div>
                  <span className="text-sm text-gray-500">Order ID: #{order.id}</span>
                  <p className="font-semibold text-lg">Pemesan: {order.user.name}</p>
                  {/* PERBAIKAN 1: Tampilkan Badge Status di sini dengan warna */}
                  <Badge className={cn("mt-2 capitalize", statusStyles[representativeStatus])}>
                    {representativeStatus}
                  </Badge>
                </div>

                <div className="text-left sm:text-right mt-2 sm:mt-0">
                  <p className="text-sm text-gray-500">Tanggal: {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <p className="font-semibold text-lg">Total Pembayaran: Rp {new Intl.NumberFormat('id-ID').format(subtotalForOwner)}</p>
                </div>
              </div>
              
              <div className="flex justify-end">
                 <Button size="sm" variant="ghost-dark" className='outline' onClick={() => handleOpenUpdateModal(order)}>Update Status & Resi</Button>
              </div>

              <div className="space-y-2 pt-4">
                <p className="text-sm font-medium text-gray-500">Detail Produk:</p>
                {order.items.map(item => (
                  <div key={item.id} className="flex items-center justify-between ml-4">
                    <div className="flex items-center gap-4">
                      <img src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${item.product.image_url}`} alt={item.product.name} className="w-12 h-12 rounded object-cover"/>
                      <div>
                        <p className="font-semibold">{item.product.name}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    {/* PERBAIKAN 2: Hapus Badge Status dari sini */}
                  </div>
                ))}
              </div>
            </div>
          )
        }) : (
          <div className="text-center p-12 border rounded-lg bg-white">
            <p>Belum ada pesanan masuk.</p>
          </div>
        )}
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
