'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Cookies from 'js-cookie';
import toast, { Toaster } from 'react-hot-toast';
import Image from "next/image";

// Definisikan tipe data agar kode lebih aman dan jelas
interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  image_url: string;
}
interface Owner {
  id: number;
  name: string;
  email: string;
  products: Product[];
}

export default function OwnerDetailPage() {
  const params = useParams();
  const id = params.id as string; // Ambil ID dari URL

  const [owner, setOwner] = useState<Owner | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fungsi untuk mengambil detail owner dan produknya
  const fetchOwnerDetails = useCallback(async () => {
    if (!id) return;

    const token = Cookies.get('auth_token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    try {
      const res = await fetch(`${apiUrl}/api/admin/users/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      if (!res.ok) throw new Error('Failed to fetch owner details. Make sure you are logged in as admin.');
      
      const data = await res.json();
      setOwner(data.data);
    } catch (error: any) {
      toast.error(error.message);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOwnerDetails();
  }, [fetchOwnerDetails]);

  // Fungsi untuk menghapus produk
  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('This action is permanent. Are you sure you want to delete this product?')) {
      return;
    }

    const token = Cookies.get('auth_token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const toastId = toast.loading('Deleting product...');

    try {
      const res = await fetch(`${apiUrl}/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to delete product.');
      
      toast.success('Product deleted successfully!', { id: toastId });
      // Muat ulang data setelah berhasil menghapus
      fetchOwnerDetails(); 
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    }
  };

  if (isLoading) return <div className="p-8 text-center">Loading owner details...</div>;
  if (!owner) return <div className="p-8 text-center">Owner not found or access denied.</div>;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Toaster position="top-center" />
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Products by: {owner.name}</h1>
        <p className="text-lg text-gray-3 00">{owner.email}</p>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase text-black">Product</th>
              <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase text-black">Price</th>
              <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase text-black">Stock</th>
              <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase text-black">Actions</th>
            </tr>
          </thead>
          <tbody>
            {owner.products && owner.products.length > 0 ? owner.products.map((product) => (
              <tr key={product.id}>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-12 h-12">

                      <Image
                        className="w-full h-full rounded-md object-cover" 
                        src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${product.image_url}`} 
                        alt={product.name} width={400} height={400}
                      />
                    
                    </div>
                    <div className="ml-3">
                      <p className="text-gray-900 whitespace-no-wrap font-semibold">{product.name}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-green-500">Rp {new Intl.NumberFormat('id-ID').format(product.price)}</td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-black">{product.stock}</td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <button onClick={() => handleDeleteProduct(product.id)} className="text-red-600 hover:text-red-900 font-semibold">
                    Delete
                  </button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={4} className="text-center p-5">This owner has no products.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}