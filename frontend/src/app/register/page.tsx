// src/app/register/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  // 1. TAMBAHKAN STATE UNTUK FIELD BARU
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [role, setRole] = useState('customer'); // <-- State baru, default 'customer'

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validasi sederhana di frontend
    if (password !== passwordConfirmation) {
      setError("Password and confirmation do not match.");
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    try {
      const res = await fetch(`${apiUrl}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json', // 3. TAMBAHKAN HEADER INI
        },
        // 1. KIRIM SEMUA DATA YANG DIBUTUHKAN
        body: JSON.stringify({
          name,
          email,
          password,
          password_confirmation: passwordConfirmation,
          role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const validationErrors = Object.values(data.errors || {}).flat().join('\n');
        throw new Error(validationErrors || data.message || 'Something went wrong');
      }
      
      // 2. LOGIKA SETELAH SUKSES DAFTAR
      setSuccess('Registration successful! Redirecting to login...');
      
      // Arahkan ke halaman login setelah 2 detik
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-sm">
      <h1 className="text-3xl font-bold mb-6 text-center">Create an Account</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-500 bg-red-100 p-3 rounded">{error}</p>}
        {success && <p className="text-green-500 bg-green-100 p-3 rounded">{success}</p>}
        
        {/* 1. TAMBAHKAN INPUT UNTUK NAMA */}
        <div>
          <label className="block mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

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

        {/* 1. TAMBAHKAN INPUT UNTUK KONFIRMASI PASSWORD */}
        <div>
          <label className="block mb-1">Confirm Password</label>
          <input
            type="password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        
        {/* OPSI PILIHAN ROLE BARU */}
        <div className="space-y-2">
          <label className="block mb-1">Register as:</label>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input type="radio" name="role" value="customer" checked={role === 'customer'} onChange={() => setRole('customer')} className="mr-2"/>
              Customer
            </label>
            <label className="flex items-center">
              <input type="radio" name="role" value="store_owner" checked={role === 'store_owner'} onChange={() => setRole('store_owner')} className="mr-2"/>
              Store Owner
            </label>
          </div>
        </div>

        <button 
          type="submit" 
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
          disabled={!!success} // Nonaktifkan tombol jika sudah sukses
        >
          Register
        </button>
        <p className="text-center text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:underline">
            Login here
          </Link>
        </p>
      </form>
    </div>
  );
}