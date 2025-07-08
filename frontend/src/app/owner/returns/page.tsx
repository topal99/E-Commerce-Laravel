'use client';

import { useEffect, useState, useCallback } from 'react';
import Cookies from 'js-cookie';
import toast, { Toaster } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image'; 

// Definisikan tipe data
interface ReturnRequest {
  id: number;
  reason: string;
  image_url: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  user: { name: string };
  order_item: {
    product: {
      name: string;
      image_url: string;
    }
  }
}

// Objek untuk gaya badge status
const statusStyles: { [key: string]: string } = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  approved: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
};

export default function OwnerReturnsPage() {
  const [requests, setRequests] = useState<ReturnRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReturnRequests = useCallback(async () => {
    setIsLoading(true);
    const token = Cookies.get('auth_token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    try {
      const res = await fetch(`${apiUrl}/api/owner/returns`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      });
      if (!res.ok) throw new Error("Gagal memuat permintaan pengembalian.");
      const data = await res.json();
      setRequests(data.data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchReturnRequests(); }, [fetchReturnRequests]);

  const handleUpdateStatus = async (requestId: number, status: 'approved' | 'rejected') => {
    const toastId = toast.loading(`Mengubah status menjadi ${status}...`);
    const token = Cookies.get('auth_token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    try {
      const res = await fetch(`${apiUrl}/api/owner/returns/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      toast.success("Status berhasil diperbarui!", { id: toastId });
      fetchReturnRequests(); // Muat ulang data
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    }
  };

  if (isLoading) return <div className="p-8 text-center">Memuat permintaan...</div>;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Toaster />
      <h1 className="text-3xl font-bold mb-6">Manajemen Pengembalian Barang</h1>
      
      <div className="space-y-6">
        {requests.length > 0 ? requests.map((req) => (
          <div key={req.id} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="font-semibold">Produk: {req.order_item.product.name}</p>
                <p className="text-sm text-gray-500">Diajukan oleh: {req.user.name}</p>
                <p className="text-xs text-gray-400">Pada: {new Date(req.created_at).toLocaleDateString('id-ID')}</p>
              </div>
              <Badge className={statusStyles[req.status]}>{req.status}</Badge>
            </div>
            
            <div className="border-t pt-4">
              <p className="font-semibold">Alasan Pengembalian:</p>
              <p className="text-gray-700 italic">"{req.reason}"</p>
              {req.image_url && (
                <div className="mt-4">
                  <p className="font-semibold text-sm mb-2">Foto Bukti:</p>

                  <a href={`${process.env.NEXT_PUBLIC_API_URL}/storage/${req.image_url}`}>
                    {/* PERBAIKAN UTAMA: Menggunakan komponen Image dari Next.js */}
                    <div className="relative w-40 h-40">
                    <Image src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${req.image_url}`} alt={req.order_item.product.name} width={400} height={400} className="object-cover aspect-square w-full group-hover:opacity-75" />
                    </div>
                  </a>

                </div>
              )}
            </div>

            {req.status === 'pending' && (
              <div className="flex justify-end gap-2 mt-4 border-t pt-4">
                <Button variant="destructive" size="sm" onClick={() => handleUpdateStatus(req.id, 'rejected')}>Tolak</Button>
                <Button variant="default" size="sm" onClick={() => handleUpdateStatus(req.id, 'approved')}>Setujui</Button>
              </div>
            )}
          </div>
        )) : <p>Tidak ada permintaan pengembalian barang.</p>}
      </div>
    </div>
  );
}
