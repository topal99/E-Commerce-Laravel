'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import { Loader2 } from 'lucide-react';

// Tipe data untuk props yang diterima
interface AddressFormProps {
  onSaveSuccess: () => void;
  initialData?: any; // Menggunakan 'any' untuk fleksibilitas mode edit
}

// Tipe data untuk wilayah dari API
interface Area {
  id: string;
  name: string;
}

export default function AddressForm({ onSaveSuccess, initialData }: AddressFormProps) {
  // PERBAIKAN 1: Gunakan satu state object untuk semua data form
  const [formData, setFormData] = useState({
    label: 'Rumah',
    recipient_name: '',
    phone_number: '',
    province: '',
    city: '',
    full_address: '', // Ini khusus untuk nama jalan, nomor rumah, dll.
    postal_code: '',
  });

  const [isSaving, setIsSaving] = useState(false);

  // State untuk dropdown wilayah
  const [provinces, setProvinces] = useState<Area[]>([]);
  const [cities, setCities] = useState<Area[]>([]);
  const [isCitiesLoading, setIsCitiesLoading] = useState(false);

  // State untuk menyimpan ID yang dipilih, untuk memicu fetch berikutnya
  const [selectedProvinceId, setSelectedProvinceId] = useState('');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const token = Cookies.get('auth_token');

  // Mengisi form dengan data awal jika dalam mode edit
  useEffect(() => {
    if (initialData) {
      setFormData({
        label: initialData.label || 'Rumah',
        recipient_name: initialData.recipient_name || '',
        phone_number: initialData.phone_number || '',
        full_address: initialData.full_address || '',
        city: initialData.city || '',
        province: initialData.province || '',
        postal_code: initialData.postal_code || '',
      });
      // Di sini bisa ditambahkan logika untuk pre-select provinsi/kota jika mode edit
    }
  }, [initialData]);

  // Ambil daftar provinsi saat komponen dimuat
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/regions/provinces`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
        });
        if (!res.ok) throw new Error("Gagal memuat provinsi.");
        const data = await res.json();
        setProvinces(data);
      } catch (error) {
        toast.error("Gagal memuat daftar provinsi.");
      }
    };
    fetchProvinces();
  }, [apiUrl, token]);

  // Ambil daftar kota saat provinsi berubah
  useEffect(() => {
    if (!selectedProvinceId) return;

    const fetchCities = async () => {
      setIsCitiesLoading(true);
      setCities([]); // Kosongkan daftar kota lama
      setFormData(prev => ({ ...prev, city: '' })); // Reset pilihan kota di form
      
      try {
        const res = await fetch(`${apiUrl}/api/regions/cities?province_id=${selectedProvinceId}`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
        });
        if (!res.ok) throw new Error("Gagal memuat kota.");
        const data = await res.json();
        setCities(data);
      } catch (error) {
        toast.error("Gagal memuat daftar kota.");
      } finally {
        setIsCitiesLoading(false);
      }
    };
    fetchCities();
  }, [selectedProvinceId, apiUrl, token]);

  // PERBAIKAN 2: Satu fungsi untuk menangani semua perubahan input teks
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch(`${apiUrl}/api/addresses${initialData ? `/${initialData.id}` : ''}`, {
        method: initialData ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData), // Kirim formData langsung
      });

      const data = await res.json();
      if (!res.ok) {
        const errorMessages = data.errors ? Object.values(data.errors).flat().join('\n') : data.message;
        throw new Error(errorMessages || 'Gagal menyimpan alamat.');
      }
      
      toast.success(`Alamat berhasil ${initialData ? 'diperbarui' : 'disimpan'}!`);
      onSaveSuccess(); // Panggil fungsi callback dari induk
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div><Label htmlFor="recipient_name">Nama Penerima</Label><Input name="recipient_name" value={formData.recipient_name} onChange={handleChange} required /></div>
      <div><Label htmlFor="phone_number">Nomor Telepon</Label><Input name="phone_number" value={formData.phone_number} onChange={handleChange} required /></div>
      
      <div>
        <Label>Provinsi</Label>
        <Select 
          value={selectedProvinceId} // Select dikontrol oleh ID
          onValueChange={(value) => {
            setSelectedProvinceId(value); // Set ID untuk fetch
            const provinceName = provinces.find(p => p.id === value)?.name || '';
            setFormData(prev => ({...prev, province: provinceName})); // Simpan nama ke form
          }}
          required
        >
          <SelectTrigger><SelectValue placeholder="Pilih Provinsi..." /></SelectTrigger>
          <SelectContent>{provinces.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <div>
        <Label>Kota/Kabupaten</Label>
        <Select 
          value={formData.city} // Select dikontrol oleh nama
          onValueChange={(value) => setFormData(prev => ({...prev, city: value}))} 
          disabled={!selectedProvinceId || isCitiesLoading} required>
          <SelectTrigger><SelectValue placeholder={isCitiesLoading ? "Memuat..." : "Pilih Kota/Kabupaten..."} /></SelectTrigger>
          <SelectContent>{cities.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="full_address">Alamat Lengkap (Nama Jalan, No. Rumah, Kecamatan, dll.)</Label>
        <Textarea name="full_address" value={formData.full_address} onChange={handleChange} placeholder="Contoh: Jl. Merdeka No. 123, Kel. Sejahtera, Kec. Makmur" required />
      </div>
      
      <div><Label htmlFor="postal_code">Kode Pos</Label><Input name="postal_code" value={formData.postal_code} onChange={handleChange} required /></div>
      
      <div><Label htmlFor="label">Label Alamat</Label><Input name="label" value={formData.label} onChange={handleChange} placeholder="Contoh: Rumah, Kantor" required /></div>

      <Button type="submit" disabled={isSaving} className="w-full">
        {isSaving ? <Loader2 className="animate-spin" /> : 'Simpan Alamat'}
      </Button>
    </form>
  );
}