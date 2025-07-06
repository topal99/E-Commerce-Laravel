'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import toast, { Toaster } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, MailCheck, Chrome } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [role, setRole] = useState('customer');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== passwordConfirmation) {
      toast.error("Password dan konfirmasi password tidak cocok.");
      return;
    }
    
    setIsLoading(true);
    const toastId = toast.loading('Membuat akun...');
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    try {
      const res = await fetch(`${apiUrl}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ name, email, password, password_confirmation: passwordConfirmation, role }),
      });

      const data = await res.json();
      if (!res.ok) {
        const errorMessages = data.errors ? Object.values(data.errors).flat().join('\n') : data.message;
        throw new Error(errorMessages || 'Gagal mendaftar.');
      }
      
      toast.success('Registrasi berhasil!', { id: toastId });
      setIsSuccess(true); // Set status sukses untuk menampilkan pesan verifikasi

    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  // Jika registrasi sudah sukses, tampilkan pesan ini, bukan form lagi.
  if (isSuccess) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center p-8 max-w-md mx-auto">
                <MailCheck className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold mb-4">Pendaftaran Berhasil!</h1>
                <p className="text-muted-foreground">
                  Satu langkah lagi! Kami telah mengirimkan link verifikasi ke email <strong>{email}</strong>. 
                  Silakan cek kotak masuk (atau folder spam) untuk mengaktifkan akun Anda.
                </p>
                <Button asChild className="mt-6">
                    <Link href="/login">Kembali ke Halaman Login</Link>
                </Button>
            </div>
        </div>
    );
  }

  return (
    <div className="w-full lg:grid">
      <Toaster position="top-center" />
      {/* Kolom Kiri: Form Registrasi */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-[380px] space-y-6">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Buat Akun Baru</CardTitle>
            <CardDescription>Isi data di bawah untuk memulai perjalanan belanja Anda.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input id="name" value={name} placeholder="Nama Lengkap" onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Input id="email" type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Input id="password" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Input id="password_confirmation" type="password" placeholder="Konfirmasi Password" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} required />
              </div>
              <div className="space-y-3 pt-2">
                <Label>Daftar sebagai:</Label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="role" value="customer" checked={role === 'customer'} onChange={() => setRole('customer')} />
                    Customer
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="role" value="store_owner" checked={role === 'store_owner'} onChange={() => setRole('store_owner')} />
                    Pemilik Toko
                  </label>
                </div>
              </div>
              <Button type="submit" className="w-full bg-black text-white" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : 'Daftar'}
              </Button>
            </form>
          </CardContent>
          <div className="mt-4 text-center text-sm">
            Sudah punya akun?{" "}
            <Link href="/login" className="underline">Login di sini</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
