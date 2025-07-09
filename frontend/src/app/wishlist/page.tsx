'use client';

import { useEffect, useState, useCallback } from 'react'; // <-- Pastikan useCallback diimpor
import { useWishlistStore } from '@/stores/wishlistStore';
import { type Product } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import Cookies from 'js-cookie';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

export default function WishlistPage() {
    const { wishlistedProductIds, fetchWishlist } = useWishlistStore();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // LANGKAH 1: Definisikan fungsi fetchProductDetails di luar useEffect
    // Kita bungkus dengan useCallback agar fungsi ini tidak dibuat ulang di setiap render,
    // kecuali jika dependensinya (dalam hal ini, tidak ada) berubah.
    const fetchProductDetails = useCallback(async () => {
        setIsLoading(true);
        const ids = Array.from(wishlistedProductIds); // Ambil ID terbaru dari store

        if (ids.length === 0) {
            setProducts([]);
            setIsLoading(false);
            return;
        }

        const token = Cookies.get('auth_token');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        try {
            const res = await fetch(`${apiUrl}/api/products/batch`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ ids: ids })
            });

            if (!res.ok) throw new Error("Gagal memuat produk wishlist.");

            const data = await res.json();
            setProducts(data.data);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    }, [wishlistedProductIds]); // Fungsi ini akan dibuat ulang hanya jika wishlistedProductIds berubah

    // LANGKAH 2: Gunakan dua useEffect untuk alur yang jelas
    // useEffect pertama: Hanya untuk mengambil daftar ID saat komponen pertama kali dimuat.
    useEffect(() => {
        fetchWishlist();
    }, [fetchWishlist]);

    // useEffect kedua: Akan berjalan setiap kali 'fetchProductDetails' (dan isinya, yaitu wishlistedProductIds) berubah.
    useEffect(() => {
        // Setelah daftar ID dimuat, fungsi ini akan terpanggil untuk mengambil detail produk.
        fetchProductDetails();
    }, [fetchProductDetails]);

  if (isLoading) {
    return <div className="p-8 text-center flex justify-center items-center gap-2"><Loader2 className="animate-spin"/> Memuat...</div>;
  }

    return (
        <div className="container mx-auto p-4 md:p-8">
            <Toaster />
            <div className="mb-8">
                <h1 className="text-4xl font-bold">Wishlist Saya</h1>
                <p className="text-lg text-gray-600">Produk yang Anda sukai, semua di satu tempat.</p>
            </div>
            
            {products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="text-center p-12 border rounded-lg bg-white">
                    <p className="text-lg">Wishlist Anda masih kosong.</p>
                    <Link href="/" className="text-blue-500 hover:underline mt-2 inline-block">
                        Cari produk yang Anda sukai
                    </Link>
                </div>
            )}
        </div>
    );
}
