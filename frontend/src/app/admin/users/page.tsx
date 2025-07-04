// src/app/admin/users/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';

// Definisikan tipe data untuk user agar lebih jelas
interface User {
  id: number;
  name: string;
  email: string;
  role: 'store_owner' | 'customer';
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fungsi untuk mengambil semua data user dari backend
  useEffect(() => {
    const fetchUsers = async () => {
      const token = Cookies.get('auth_token');
      if (!token) {
        toast.error("Authentication failed. Redirecting to login.");
        // router.push('/login'); // Anda bisa tambahkan router jika perlu
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      try {
        const res = await fetch(`${apiUrl}/api/admin/users`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });

        if (!res.ok) {
          throw new Error('Failed to fetch users. You might not have admin access.');
        }

        const data = await res.json();
        setUsers(data.data);
      } catch (error: any) {
        toast.error(error.message);
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Pisahkan user berdasarkan rolenya untuk ditampilkan
  const storeOwners = users.filter(u => u.role === 'store_owner');
  const customers = users.filter(u => u.role === 'customer');

  if (isLoading) {
    return <div className="p-8 text-center">Loading users...</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <Toaster position="top-center" />
      <h1 className="text-3xl font-bold mb-6">Users Management</h1>

      {/* Bagian Pemilik Toko */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">Store Owners ({storeOwners.length})</h2>
        <div className="space-y-3">
          {storeOwners.length > 0 ? storeOwners.map(owner => (
            <Link key={owner.id} href={`/admin/users/${owner.id}`} className="block">
              <div className="p-4 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors">
                <p className="font-bold text-lg text-black">{owner.name}</p>
                <p className="text-sm text-gray-600">{owner.email}</p>
              </div>
            </Link>
          )) : <p>No store owners found.</p>}
        </div>
      </div>

      {/* Bagian Customer */}
      <div>
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">Customers ({customers.length})</h2>
        <div className="space-y-3">
          {customers.length > 0 ? customers.map(customer => (
            <div key={customer.id} className="p-4 bg-white rounded-lg shadow-md">
              <p className="font-bold text-lg text-black">{customer.name}</p>
              <p className="text-sm text-gray-600">{customer.email}</p>
            </div>
          )) : <p>No customers found.</p>}
        </div>
      </div>
    </div>
  );
}