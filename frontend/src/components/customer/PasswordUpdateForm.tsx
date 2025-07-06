'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';

export default function PasswordUpdateForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== passwordConfirmation) {
      toast.error("Password baru dan konfirmasi tidak cocok.");
      return;
    }
    
    setIsSaving(true);
    const token = Cookies.get('auth_token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    try {
      const res = await fetch(`${apiUrl}/api/profile/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          current_password: currentPassword,
          password: newPassword,
          password_confirmation: passwordConfirmation,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal mengganti password.');
      
      toast.success('Password berhasil diperbarui!');
      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setPasswordConfirmation('');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="current_password">Password Saat Ini</Label>
        <Input id="current_password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="new_password">Password Baru</Label>
        <Input id="new_password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="password_confirmation">Konfirmasi Password Baru</Label>
        <Input id="password_confirmation" type="password" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} required />
      </div>
      <Button type="submit" disabled={isSaving} className="w-full sm:w-auto outline" variant="ghost-dark">
        {isSaving ? 'Menyimpan...' : 'Ganti Password'}
      </Button>
    </form>
  );
}
