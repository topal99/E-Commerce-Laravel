'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';
import { useAuthStore } from '@/stores/authStore';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    // 1. Ambil semua data penting dari parameter URL
    const token = searchParams.get('token');
    const role = searchParams.get('role');
    const name = searchParams.get('name');
    const email = searchParams.get('email');

    // 2. Pastikan semua data ada
    if (token && role && name && email) {
      // 3. Buat objek user sederhana untuk disimpan di state global
      const user = {
        id: 0, // ID tidak terlalu penting di frontend, 0 sebagai placeholder
        name: decodeURIComponent(name), // Decode nama jika ada spasi, dll.
        email: decodeURIComponent(email),
        role: role as 'admin' | 'store_owner' | 'customer',
      };

      // 4. Simpan "kartu identitas" ke cookie agar middleware bisa membacanya
      Cookies.set('auth_token', token, { expires: 7 });
      Cookies.set('auth_role', role, { expires: 7 });

      // 5. Simpan data ke state global (Zustand) agar header bisa langsung berubah
      setAuth(token, user);

      // 6. Arahkan pengguna ke halaman utama
      router.push('/');
    } else {
      // Jika ada data yang hilang, anggap gagal dan arahkan kembali ke login
      router.push('/login?error=google_auth_failed');
    }
  }, [searchParams, router, setAuth]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Mengesahkan sesi Anda, harap tunggu...</p>
      </div>
    </div>
  );
}
