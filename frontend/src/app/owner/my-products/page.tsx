'use client';

import { useEffect, useState, useCallback } from 'react';
import Cookies from 'js-cookie';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import { type Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import ProductForm from '@/components/owner/ProductForm'; // Import form universal kita
import Image from "next/image";

// Definisikan tipe untuk kategori
interface Category {
  id: number;
  name: string;
}

export default function MyProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]); // <-- State baru untuk menyimpan daftar kategori
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Fungsi sekarang mengambil produk DAN kategori
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const token = Cookies.get('auth_token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    try {
      // Kita panggil kedua API secara bersamaan untuk efisiensi
      const [productsRes, categoriesRes] = await Promise.all([
        fetch(`${apiUrl}/api/my-products`, { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } }),
        fetch(`${apiUrl}/api/categories`, { headers: { 'Accept': 'application/json' } })
      ]);
      
      if (!productsRes.ok) throw new Error("Gagal memuat produk Anda.");
      if (!categoriesRes.ok) throw new Error("Gagal memuat daftar kategori.");

      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();
      
      setProducts(productsData.data);
      setCategories(categoriesData.data);
    } catch (error: any) {
      toast.error(error.message || "Tidak dapat memuat data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fungsi untuk membuka modal dalam mode "Create"
  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  // Fungsi untuk membuka modal dalam mode "Edit"
  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  // Fungsi serbaguna untuk menyimpan (Create & Update)
  const handleSave = async (formData: FormData) => {
    setIsSaving(true);
    const token = Cookies.get('auth_token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    
    const isEditMode = !!editingProduct;
    const url = isEditMode ? `${apiUrl}/api/products/${editingProduct.id}` : `${apiUrl}/api/products`;
    const method = 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) {
         const errorMessages = data.errors ? Object.values(data.errors).flat().join('\n') : data.message;
         throw new Error(errorMessages || 'Gagal menyimpan produk.');
      }
      
      toast.success(`Produk berhasil ${isEditMode ? 'diperbarui' : 'dibuat'}!`);
      setIsModalOpen(false); // Tutup modal
      fetchData(); // Muat ulang semua data (produk & kategori)
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (productId: number) => {
    if (!window.confirm('Anda yakin ingin menghapus produk ini? Aksi ini tidak dapat dibatalkan.')) return;
    
    const token = Cookies.get('auth_token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const toastId = toast.loading('Menghapus produk...');

    try {
      const res = await fetch(`${apiUrl}/api/products/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      if (!res.ok) throw new Error('Gagal menghapus produk.');
      toast.success('Produk berhasil dihapus!', { id: toastId });
      fetchData();
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Memuat produk Anda...</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Toaster position="top-center" />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Produk Saya</h1>
        <Button className="outline" variant="ghost-dark" onClick={handleOpenCreateModal}>+ Tambah Produk Baru</Button>
      </div>
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Produk</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Harga</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Stok</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? products.map((product) => (
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
                    <div className="ml-3"><p className="font-semibold">{product.name}</p><p className="text-sm text-gray-600">{product.category?.name || 'Uncategorized'}</p></div>
                  </div>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-green-500 text-sm">Rp {new Intl.NumberFormat('id-ID').format(product.price)}</td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{product.stock}</td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <div className="flex items-center gap-3">
                    <Button variant="ghost-dark" className='outline' size="sm" onClick={() => handleOpenEditModal(product)}>Edit</Button>
                    <Button variant="ghost-dark"className='outline' size="sm" onClick={() => handleDelete(product.id)}>Delete</Button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={4} className="text-center p-5">Anda belum memiliki produk.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Universal untuk Create dan Edit */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}</DialogTitle>
            <DialogDescription>
              Isi detail produk Anda di bawah ini. Klik simpan jika sudah selesai.
            </DialogDescription>
          </DialogHeader>
          {/* Teruskan daftar kategori ke dalam form */}
          <ProductForm 
            onSave={handleSave} 
            isSaving={isSaving} 
            initialData={editingProduct} 
            categories={categories}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
