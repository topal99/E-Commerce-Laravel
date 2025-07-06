'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';

// Definisikan tipe User di sini juga agar konsisten
interface UserProfile { name: string; email: string; }
interface ProfileUpdateFormProps {
  currentUser: UserProfile;
  // PERBAIKAN: Callback sekarang akan menerima data user yang sudah diupdate
  onProfileUpdate: (updatedUser: UserProfile) => void; 
}

export default function ProfileUpdateForm({ currentUser, onProfileUpdate }: ProfileUpdateFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setName(currentUser.name);
    setEmail(currentUser.email);
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const token = Cookies.get('auth_token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    try {
      const res = await fetch(`${apiUrl}/api/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal memperbarui profil.');
      
      toast.success('Profil berhasil diperbarui!');
      
      // PERBAIKAN: Panggil callback dengan membawa data baru dari API
      onProfileUpdate(data.data); 
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nama Lengkap</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <Button type="submit" disabled={isSaving} className="w-full sm:w-auto outline" variant="ghost-dark">
        {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
      </Button>
    </form>
  );
}
