'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Cookies from 'js-cookie';
import toast, { Toaster } from 'react-hot-toast';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Chrome, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // State untuk menampilkan tombol kirim ulang verifikasi
  const [showResend, setShowResend] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);

  // Fungsi untuk mengirim ulang email verifikasi
  const handleResendVerification = async () => {
    const toastId = toast.loading('Mengirim ulang email...');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    try {
      // Kita perlu cara untuk login sementara agar bisa mengakses rute ini
      // Untuk sekarang, kita asumsikan backend akan menangani ini berdasarkan sesi
      const res = await fetch(`${apiUrl}/api/email/verification-notification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${Cookies.get('auth_token')}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Link verifikasi baru telah dikirim!", { id: toastId });
    } catch (error: any) {
      toast.error(error.message || "Gagal mengirim ulang.", { id: toastId });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setShowResend(false); // Reset state setiap kali mencoba login
    const toastId = toast.loading('Mencoba untuk login...');

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    try {
      const res = await fetch(`${apiUrl}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        // Cek jika error karena email belum diverifikasi (status 403)
        if (res.status === 403 && data.message.includes('not verified')) {
          setShowResend(true); // Tampilkan opsi kirim ulang
          throw new Error('Email Anda belum diverifikasi. Silakan cek kotak masuk Anda.');
        }
        const errorMessage = data.errors ? Object.values(data.errors).flat().join('\n') : data.message;
        throw new Error(errorMessage || 'Email atau password salah.');
      }
      
      const token = data.data.token;
      const user = data.data.user;

      Cookies.set('auth_token', token, { expires: 7, secure: process.env.NODE_ENV === 'production' });
      Cookies.set('auth_role', user.role, { expires: 7, secure: process.env.NODE_ENV === 'production' });
      setAuth(token, user);
      
      toast.success('Login berhasil! Mengarahkan...', { id: toastId });

      const redirectUrl = searchParams.get('redirect');
      router.push(redirectUrl || '/');

    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Toaster position="top-center" />
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-[380px] space-y-6">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Selamat Datang Kembali</CardTitle>
            <CardDescription>Masukkan email dan password Anda untuk masuk.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input id="email" type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Input id="password" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full bg-black text-white" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : 'Login'}
              </Button>
            </form>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Atau lanjutkan dengan</span></div>
            </div>
            <Button variant="ghost-dark" className="w-full outline" asChild>
              <a href={`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google/redirect`}>
                <Chrome className="mr-2 h-4 w-4" /> Login dengan Google
              </a>
            </Button>
          </CardContent>
          {/* Tampilkan tombol ini secara kondisional */}
          {showResend && (
            <div className="mt-4 text-center text-sm">
              Tidak menerima email?{' '}
              <Button variant="link" className="p-0 h-auto" onClick={handleResendVerification}>
                Kirim ulang link verifikasi
              </Button>
            </div>
          )}
          <div className="mt-4 text-center text-sm">
            Belum punya akun?{" "}
            <Link href="/register" className="underline">Daftar di sini</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
