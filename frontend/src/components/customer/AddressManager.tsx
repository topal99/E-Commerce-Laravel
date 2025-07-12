'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Home, Briefcase, Trash2, Edit, PlusCircle } from 'lucide-react';
import AddressForm from './AddressForm'; // Asumsi form ini sudah ada dan berfungsi
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';

// KOREKSI 1: Definisikan tipe Address langsung di sini
interface Address {
  id: number;
  label: string;
  recipient_name: string;
  phone_number: string;
  full_address: string;
  city: string;
}

interface AddressManagerProps {
  addresses: Address[];
  onAddressSelect: (addressId: number) => void;
  onDataChange: () => void; // Fungsi untuk memuat ulang daftar alamat
  selectedAddressId: number | null;
}

export default function AddressManager({ addresses, onAddressSelect, onDataChange, selectedAddressId }: AddressManagerProps) {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<number | null>(null);

  const handleOpenCreateModal = () => {
    setEditingAddress(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (address: Address) => {
    setEditingAddress(address);
    setIsFormModalOpen(true);
  };

  const promptDelete = (addressId: number) => {
    setAddressToDelete(addressId);
    setIsConfirmDeleteOpen(true);
  };

  const executeDelete = async () => {
    if (!addressToDelete) return;
    
    const toastId = toast.loading("Menghapus alamat...");
    const token = Cookies.get('auth_token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    try {
      const res = await fetch(`${apiUrl}/api/addresses/${addressToDelete}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      });
      if (!res.ok) throw new Error("Gagal menghapus alamat.");
      
      toast.success("Alamat berhasil dihapus!", { id: toastId });
      onDataChange(); // Panggil fungsi refresh dari induk
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    } finally {
      setIsConfirmDeleteOpen(false); // Tutup dialog setelah selesai
      setAddressToDelete(null);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Pilih atau Kelola Alamat</h3>
        <Button variant="outline" size="sm" onClick={handleOpenCreateModal}>
          <PlusCircle className="w-4 h-4 mr-2" />
          Alamat Baru
        </Button>
      </div>
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {/* PERBAIKAN: Gunakan index untuk memastikan key selalu unik */}
        {addresses.map((address, index) => (
          <div key={`${address.id}-${index}`} className={`p-4 border rounded-lg transition-all ${selectedAddressId === address.id ? 'border-blue-500 ring-2 ring-blue-200' : ''}`}>
            <div className="flex justify-between items-start">
              <div className="flex-1 flex gap-4 cursor-pointer" onClick={() => onAddressSelect(address.id)}>
                <div className="text-blue-500 mt-1 flex-shrink-0">
                  {address.label.toLowerCase() === 'rumah' ? <Home /> : <Briefcase />}
                </div>
                <div>
                  <p className="font-bold">{address.label}</p>
                  <p className="font-semibold">{address.recipient_name}</p>
                  <p className="text-sm text-gray-600">{address.full_address}, {address.city}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEditModal(address)}><Edit className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => promptDelete(address.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal untuk Form (Create/Edit) */}
      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAddress ? 'Edit Alamat' : 'Tambah Alamat Baru'}</DialogTitle>
          </DialogHeader>
          <AddressForm
            initialData={editingAddress}
            onSaveSuccess={() => {
              setIsFormModalOpen(false);
              onDataChange(); // Refresh daftar alamat
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog untuk konfirmasi hapus */}
      <Dialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus alamat ini? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Batal</Button>
            </DialogClose>
            <Button variant="destructive" onClick={executeDelete}>Hapus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
