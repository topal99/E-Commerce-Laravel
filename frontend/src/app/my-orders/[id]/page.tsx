'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import toast, { Toaster } from 'react-hot-toast';
import { type Product } from '@/lib/types';
import OrderStatusProgress from '@/components/OrderStatusProgress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Home, MapPin, Loader2, Tag, Undo2, Map, LocationEdit, Car, CarIcon } from 'lucide-react'; 
import Image from 'next/image';
import ReturnRequestForm from '@/components/customer/ReturnRequestForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import TrackingModal from '@/components/customer/TrackingModal';

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

interface ReturnRequest { id: number; status: string; }

interface OrderItem {
  id: number;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  tracking_number: string | null;
  courier_name: string | null;
  product: Product;
  quantity: number;
  price: number;
  return_request: ReturnRequest | null; 
}

interface Order { 
  id: number; 
  created_at: string; 
  items: OrderItem[]; 
  shipping_address: Address | null;
  shipping_cost: number;
  total_price: number;
  coupon_code: string | null;
  discount_amount: number;
}

export default function OrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [selectedTrackingItem, setSelectedTrackingItem] = useState<OrderItem | null>(null);

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedReturnItem, setSelectedReturnItem] = useState<OrderItem | null>(null);

  const handleOpenTrackingModal = (item: OrderItem) => {
    setSelectedTrackingItem(item);
    setIsTrackingModalOpen(true);
  };

  // Fungsi untuk mengambil detail pesanan dari API
  const fetchOrderDetails = useCallback(async () => {
    setIsLoading(true);
    const token = Cookies.get('auth_token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    try {
      const res = await fetch(`${apiUrl}/api/orders/${id}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      });
      if (!res.ok) throw new Error("Gagal memuat detail pesanan.");
      const data = await res.json();
      setOrder(data.data);
    } catch (error: any) {
      toast.error(error.message);
      setOrder(null); // Set ke null jika error
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchOrderDetails();
    }
  }, [id, fetchOrderDetails]);

  // Fungsi untuk membatalkan pesanan
  const handleCancelOrder = async () => {
    if (!order || !window.confirm('Anda yakin ingin membatalkan pesanan ini?')) return;
    
    const toastId = toast.loading('Membatalkan pesanan...');
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const token = Cookies.get('auth_token');
      const res = await fetch(`${apiUrl}/api/orders/${order.id}/cancel`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      toast.success('Pesanan berhasil dibatalkan.', { id: toastId });
      fetchOrderDetails(); // Muat ulang data untuk melihat status baru
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    }
  };

  // Fungsi untuk membuka modal pengembalian
  const handleOpenReturnModal = (item: OrderItem) => {
    setSelectedReturnItem(item);
    setIsReturnModalOpen(true);
  };
  
  if (isLoading) {
    return <div className="p-8 text-center flex items-center justify-center gap-2"><Loader2 className="animate-spin" /><span>Memuat detail pesanan...</span></div>;
  }
  if (!order) {
    return <div className="p-8 text-center">Pesanan tidak ditemukan atau Anda tidak memiliki akses.</div>;
  }

  // Ambil data representatif dari item pertama untuk tampilan ringkas
  const representativeStatus = order.items[0]?.status || 'processing';
  const trackingNumber = order.items[0]?.tracking_number;
  // const totalPrice = order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const subtotal = order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Toaster />
      <h1 className="text-3xl font-bold mb-2">Detail Pesanan #{order.id}</h1>
      <p className="text-muted-foreground mb-6">Dipesan pada {new Date(order.created_at).toLocaleDateString('id-ID', { dateStyle: 'full' })}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Kolom Kiri: Detail Produk */}
        <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <div className="pb-6">
            <h3 className="text-lg font-semibold mb-4">Produk yang Dipesan</h3>

            <div className="space-y-4">
              {order.items.map(item => (
                <div key={item.id} className="flex gap-4">
                  <Image src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${item.product.image_url}`} 
                  alt={item.product.name} width={400} height={400} className="w-24 h-24 rounded object-cover"/>
                  <div>
                    <p className="font-semibold">{item.product.name}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    <p className="text-sm text-gray-600">Harga: Rp {new Intl.NumberFormat('id-ID').format(item.price)}</p>
                    {/* PERBAIKAN UTAMA: Tombol Aksi per Item */}
                    <div className="mt-2">
                      {/* Tampilkan tombol "Beri Ulasan" jika sudah diterima & belum ada ulasan */}
                      {item.status === 'delivered' && (
                        <Link href={`/products/${item.product.slug}?review=true`}><Button size="sm" variant="outline">Beri Ulasan</Button></Link>
                      )}
                      {/* Tampilkan tombol "Ajukan Pengembalian" jika sudah diterima & BELUM pernah diajukan */}
                      {item.status === 'delivered' && !item.return_request && (
                        <Button size="sm" variant="secondary" className="ml-2" onClick={() => handleOpenReturnModal(item)}>
                          <Undo2 className="w-4 h-4 mr-2" />
                          Ajukan Pengembalian
                        </Button>
                      )}

                      {/* Tampilkan status jika sudah pernah diajukan */}
                      {item.return_request && (
                        <Badge className='bg-yellow-700 text-white'>Permintaan Pengembalian Diproses</Badge>
                      )}
                    
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Status & Alamat */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">Status Pengiriman</h2>
            <OrderStatusProgress status={representativeStatus} />
            {trackingNumber && (
              <div className="mt-4">
                <p className="font-semibold text-sm">No. Resi: <Badge variant="secondary">{trackingNumber}</Badge></p>
              </div>
            )}
            
            <div className='fles gap-2'>
              {order.items.map(item => (
                <div key={item.id}>
                    <div className="mt-2">
                      {item.courier_name && (
                        <p className="font-semibold text-sm">Nama Kurir: <Badge variant="secondary">{item.courier_name}</Badge></p>
                      )}
                      {item.tracking_number && (
                        <Button size="lg" className="mt-2" onClick={() => handleOpenTrackingModal(item)}>
                          <CarIcon className="h5-w-4" />
                          Lacak Paket
                        </Button>
                     )}
                    </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><MapPin className="w-5 h-5" /> Alamat Pengiriman</h2>
            {order.shipping_address ? (
              <div className="space-y-1 text-sm text-gray-700">
                <p className="font-semibold">{order.shipping_address.recipient_name} ({order.shipping_address.label})</p>
                <p>{order.shipping_address.phone_number}</p>
                <p>{order.shipping_address.full_address}</p>
                <p>{order.shipping_address.city}, {order.shipping_address.province} {order.shipping_address.postal_code}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Informasi alamat tidak tersedia.</p>
            )}
          </div>
                    {/* Bagian untuk Rincian Pembayaran */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">Rincian Pembayaran</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <p className="text-muted-foreground">Subtotal Produk</p>
                <p>Rp {new Intl.NumberFormat('id-ID').format(subtotal)}</p>
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
            </div>

            <div className="flex justify-between font-bold text-lg mt-2">
              <p>Total Pembayaran</p>
              <p>Rp {new Intl.NumberFormat('id-ID').format(order.total_price)}</p>
            </div>
          </div>

          {/* Tombol Aksi Dinamis */}
          <div className="mt-6 pt-6 flex justify-start">
            {representativeStatus === 'processing' && (
              <Button variant="destructive" className='bg-red-600 text-white' onClick={handleCancelOrder}>Batalkan Pesanan</Button>)}
          </div>

              {/* Modal untuk menampilkan hasil pelacakan */}
              <Dialog open={isTrackingModalOpen} onOpenChange={setIsTrackingModalOpen}>
                <DialogContent>
                  <DialogHeader><DialogTitle>Riwayat Perjalanan Paket</DialogTitle></DialogHeader>
                  {selectedTrackingItem && <TrackingModal orderItem={selectedTrackingItem} />}
                </DialogContent>
              </Dialog>

                {/* Modal untuk Form Pengembalian */}
            <Dialog open={isReturnModalOpen} onOpenChange={setIsReturnModalOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajukan Pengembalian Barang</DialogTitle>
                  <DialogDescription>
                    Jelaskan alasan Anda mengajukan pengembalian untuk produk ini.
                  </DialogDescription>
                </DialogHeader>
                {selectedReturnItem && (
                  <ReturnRequestForm
                    orderItem={selectedReturnItem}
                    onSubmitted={() => {
                      setIsReturnModalOpen(false);
                      fetchOrderDetails(); // Muat ulang data untuk melihat status baru
                    }}
                  />
                )}
              </DialogContent>
            </Dialog>
        </div>
      </div>
    </div>
  );
}
