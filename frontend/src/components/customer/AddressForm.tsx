'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';

interface AddressFormProps {
  onSaveSuccess: () => void; // Fungsi callback setelah berhasil menyimpan
}

export default function AddressForm({ onSaveSuccess }: AddressFormProps) {
  const [formData, setFormData] = useState({
    label: 'Rumah',
    recipient_name: '',
    phone_number: '',
    full_address: '',
    city: '',
    province: '',
    postal_code: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const token = Cookies.get('auth_token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    try {
      const res = await fetch(`${apiUrl}/api/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        // Menampilkan error validasi dari Laravel jika ada
        const errorMessages = data.errors ? Object.values(data.errors).flat().join('\n') : data.message;
        throw new Error(errorMessages || 'Gagal menyimpan alamat.');
      }
      
      toast.success("Alamat baru berhasil disimpan!");
      onSaveSuccess(); // Panggil fungsi callback dari induk
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="label">Label Alamat (cth: Rumah, Kantor)</Label>
          <Input id="label" name="label" value={formData.label} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="recipient_name">Nama Penerima</Label>
          <Input id="recipient_name" name="recipient_name" value={formData.recipient_name} onChange={handleChange} required />
        </div>
      </div>
      <div>
        <Label htmlFor="phone_number">Nomor Telepon</Label>
        <Input id="phone_number" name="phone_number" value={formData.phone_number} onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="full_address">Alamat Lengkap</Label>
        <Textarea id="full_address" name="full_address" value={formData.full_address} onChange={handleChange} required />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="province">Provinsi</Label>
          <Input id="province" name="province" value={formData.province} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="city">Kota/Kabupaten</Label>
          <Input id="city" name="city" value={formData.city} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="postal_code">Kode Pos</Label>
          <Input id="postal_code" name="postal_code" value={formData.postal_code} onChange={handleChange} required />
        </div>
      </div>

      <Button type="submit" disabled={isSaving} className="w-full">
        {isSaving ? 'Menyimpan...' : 'Simpan Alamat'}
      </Button>
    </form>
  );
}
