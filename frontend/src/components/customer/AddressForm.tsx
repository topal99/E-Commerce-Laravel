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

// Tipe data baru sesuai respons API Biteship
interface Area { id: string; name: string; }

const fetchWithAuth = async (url: string) => {
  const token = Cookies.get('auth_token');
  return fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json', // <-- Header paling penting untuk mencegah redirect
      'Authorization': `Bearer ${token}`,
    },
  });
};

export default function AddressForm({ onSaveSuccess }: { onSaveSuccess: () => void }) {
  const [isSaving, setIsSaving] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');

  const [provinces, setProvinces] = useState<Area[]>([]);
  const [cities, setCities] = useState<Area[]>([]);
  const [districts, setDistricts] = useState<Area[]>([]);

  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');

  const [isCitiesLoading, setIsCitiesLoading] = useState(false);
  const [isDistrictsLoading, setIsDistrictsLoading] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // Ambil daftar provinsi
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await fetchWithAuth(`${apiUrl}/api/regions/provinces`);
        if (!res.ok) throw new Error("Gagal memuat provinsi.");
        const data = await res.json();
        setProvinces(data);
      } catch (error) { toast.error("Gagal memuat daftar provinsi."); }
    };
    fetchProvinces();
  }, [apiUrl]);

  // Ambil daftar kota saat provinsi berubah
  useEffect(() => {
    if (!selectedProvince) return;
    const fetchCities = async () => {
      setIsCitiesLoading(true);
      setCities([]); setSelectedCity(''); setDistricts([]); setSelectedDistrict('');
      try {
        const res = await fetchWithAuth(`${apiUrl}/api/regions/cities?province_name=${selectedProvince}`);
        if (!res.ok) throw new Error("Gagal memuat kota.");
        const data = await res.json();
        setCities(data);
      } catch (error) { toast.error("Gagal memuat daftar kota."); } 
      finally { setIsCitiesLoading(false); }
    };
    fetchCities();
  }, [selectedProvince, apiUrl]);

  // Ambil daftar kecamatan saat kota berubah
  useEffect(() => {
    if (!selectedCity) return;
    const fetchDistricts = async () => {
      setIsDistrictsLoading(true);
      setDistricts([]); setSelectedDistrict('');
      try {
        const res = await fetchWithAuth(`${apiUrl}/api/regions/districts?city_name=${selectedCity}`);
        if (!res.ok) throw new Error("Gagal memuat kecamatan.");
        const data = await res.json();
        setDistricts(data);
      } catch (error) { toast.error("Gagal memuat daftar kecamatan."); } 
      finally { setIsDistrictsLoading(false); }
    };
    fetchDistricts();
  }, [selectedCity, apiUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const formData = {
      label: 'Rumah',
      recipient_name: recipientName,
      phone_number: phoneNumber,
      full_address: fullAddress,
      province: selectedProvince,
      city: selectedCity,
      postal_code: postalCode,
    };

    try {
      const token = Cookies.get('auth_token');
      const res = await fetch(`${apiUrl}/api/addresses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal menyimpan alamat.');
      toast.success("Alamat baru berhasil disimpan!");
      onSaveSuccess();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      {/* ... (Field Nama Penerima & Telepon) ... */}
      <div><Label>Nama Penerima</Label><Input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} required /></div>
      <div><Label>Nomor Telepon</Label><Input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required /></div>

      {/* Dropdown Provinsi */}
      <div>
        <Label>Provinsi</Label>
        <Select value={selectedProvince} onValueChange={setSelectedProvince} required>
          <SelectTrigger><SelectValue placeholder="Pilih Provinsi..." /></SelectTrigger>
          <SelectContent>{provinces.map(p => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {/* Dropdown Kota/Kabupaten */}
      <div>
        <Label>Kota/Kabupaten</Label>
        <Select value={selectedCity} onValueChange={setSelectedCity} disabled={!selectedProvince || isCitiesLoading} required>
          <SelectTrigger><SelectValue placeholder={isCitiesLoading ? "Memuat..." : "Pilih Kota/Kabupaten..."} /></SelectTrigger>
          <SelectContent>{cities.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {/* Dropdown Kecamatan */}
      <div>
        <Label>Kecamatan</Label>
        <Select value={selectedDistrict} onValueChange={setSelectedDistrict} disabled={!selectedCity || isDistrictsLoading} required>
          <SelectTrigger><SelectValue placeholder={isDistrictsLoading ? "Memuat..." : "Pilih Kecamatan..."} /></SelectTrigger>
          <SelectContent>{districts.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {/* Field Alamat Lengkap & Kode Pos */}
      <div><Label>Alamat Lengkap (Nama Jalan, No. Rumah, dll)</Label><Textarea value={fullAddress} onChange={(e) => setFullAddress(e.target.value)} required /></div>
      <div><Label>Kode Pos</Label><Input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required /></div>

      <Button type="submit" disabled={isSaving} className="w-full">
        {isSaving ? <Loader2 className="animate-spin" /> : 'Simpan Alamat'}
      </Button>
    </form>
  );
}
