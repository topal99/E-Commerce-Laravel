// src/app/login/page.tsx
'use client'; // <-- Wajib ada untuk menggunakan hook seperti useState

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie'; // <-- IMPORT Cookies
import { useAuthStore } from '@/stores/authStore'; // <-- IMPORT AUTH STORE

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth); // <-- Ambil fungsi setAuth

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiUrl}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Ambil pesan error dari backend
        throw new Error(data.message || 'Something went wrong');
      }

        // Setelah fetch berhasil
      const token = data.data.token;
      const user = data.data.user;

      // Simpan token ke cookie, berlaku selama 7 hari
      Cookies.set('auth_token', token, { expires: 7, secure: true }); 

      // Panggil setAuth untuk update state global
      setAuth(token, user);

      // Simpan token ke localStorage (untuk contoh ini)
      localStorage.setItem('auth_token', data.data.token);

      // Arahkan ke halaman utama setelah login berhasil
      router.push('/');

    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-sm">
      <h1 className="text-3xl font-bold mb-6 text-center">Login</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-500 bg-red-100 p-3 rounded">{error}</p>}
        <div>
          <label className="block mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
          Login
        </button>
      </form>
    </div>
  );
}