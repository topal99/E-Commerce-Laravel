'use client';

import { useEffect, useState, useCallback } from 'react';
import Cookies from 'js-cookie';
import toast, { Toaster } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { PlusCircle, Home, Briefcase, Trash2, Loader2 } from 'lucide-react';
import AddressForm from '@/components/customer/AddressForm'; // Komponen form baru

// Definisikan tipe data untuk alamat
export interface Address {
  id: number;
  label: string;
  recipient_name: string;
  phone_number: string;
  full_address: string;
  city: string;
  province: string;
  postal_code: string;
  is_primary: boolean;
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fungsi untuk mengambil semua alamat dari backend
  const fetchAddresses = useCallback(async () => {
    setIsLoading(true);
    const token = Cookies.get('auth_token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    try {
      const res = await fetch(`${apiUrl}/api/addresses`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      });
      if (!res.ok) throw new Error("Gagal memuat alamat.");
      const data = await res.json();
      setAddresses(data.data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  // Fungsi untuk menghapus alamat
  const handleDelete = async (addressId: number) => {
    if (!window.confirm("Anda yakin ingin menghapus alamat ini?")) return;

    const toastId = toast.loading("Menghapus alamat...");
    const token = Cookies.get('auth_token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    try {
      const res = await fetch(`${apiUrl}/api/addresses/${addressId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      });
      if (!res.ok) throw new Error("Gagal menghapus alamat.");
      
      toast.success("Alamat berhasil dihapus!", { id: toastId });
      fetchAddresses(); // Muat ulang daftar alamat
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    }
  };

  // Fungsi yang akan dipanggil oleh form saat alamat baru disimpan
  const handleSaveSuccess = () => {
    setIsModalOpen(false); // Tutup modal
    fetchAddresses(); // Muat ulang daftar alamat
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center flex items-center justify-center gap-2">
        <Loader2 className="animate-spin" />
        <span>Memuat alamat Anda...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Toaster position="top-center" />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Buku Alamat</h1>
        
        {/* Tombol ini sekarang membuka modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" /> Tambah Alamat Baru
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Alamat Baru</DialogTitle>
              <DialogDescription>
                Masukkan detail alamat pengiriman Anda. Pastikan semua informasi sudah benar.
              </DialogDescription>
            </DialogHeader>
            {/* Komponen form dipanggil di dalam modal */}
            <AddressForm onSaveSuccess={handleSaveSuccess} />
          </DialogContent>
        </Dialog>

      </div>
      <div className="space-y-4">
        {addresses.length > 0 ? addresses.map(address => (
          <div key={address.id} className="bg-white p-6 rounded-lg shadow-md flex justify-between items-start">
            <div className="flex gap-4">
              <div className="text-blue-500 mt-1 flex-shrink-0">
                {address.label.toLowerCase() === 'rumah' ? <Home /> : <Briefcase />}
              </div>
              <div>
                <p className="font-bold">{address.label} {address.is_primary && <span className="text-xs text-blue-600">(Utama)</span>}</p>
                <p className="font-semibold">{address.recipient_name}</p>
                <p className="text-sm text-gray-600">{address.phone_number}</p>
                <p className="text-sm text-gray-600">{address.full_address}, {address.city}, {address.province}, {address.postal_code}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => handleDelete(address.id)}>
              <Trash2 className="w-5 h-5 text-red-500" />
            </Button>
          </div>
        )) : (
          <div className="text-center p-12 border rounded-lg bg-white">
            <p>Anda belum memiliki alamat tersimpan.</p>
          </div>
        )}
      </div>
    </div>
  );
}
