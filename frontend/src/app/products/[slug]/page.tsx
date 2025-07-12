import { type Metadata } from 'next'; 
import { type Product } from "@/lib/types";
import ProductView from "@/components/ProductView";
import { Suspense } from 'react';
import ProductDetailsSkeleton from '@/components/ProductDetailsSkeleton'; 
import ProductGallerySkeleton from '@/components/ProductGallerySkeleton'; 

// Fungsi untuk mengambil data produk (tidak ada perubahan)
async function getProduct(slug: string): Promise<Product | null> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    try {
        const res = await fetch(`${apiUrl}/api/products/${slug}`, { cache: 'no-store' });
        if (!res.ok) return null;
        const data = await res.json();
        return data.data;
    } catch (error) {
        console.error("Gagal memuat produk:", error);
        return null;
    }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  // Ambil data produk berdasarkan slug dari URL
  const product = await getProduct(params.slug);

  // Jika produk tidak ditemukan, kembalikan metadata default
  if (!product) {
    return {
      title: "Produk Tidak Ditemukan",
      description: "Produk yang Anda cari tidak tersedia.",
    };
  }

  // Jika produk ditemukan, buat judul dan deskripsi yang unik
  return {
    title: `${product.name} | Phoenix Store`, // Contoh: "Kemeja Flanel Biru | Phoenix Store"
    description: product.description.substring(0, 160), // Ambil 160 karakter pertama dari deskripsi produk
    // Anda juga bisa menambahkan metadata lain di sini, seperti gambar untuk social media
    openGraph: {
        title: `${product.name} | Phoenix Store`,
        description: product.description.substring(0, 160),
        images: [
            {
                url: `${process.env.NEXT_PUBLIC_API_URL}/storage/${product.image_url}`,
                width: 800,
                height: 800,
                alt: product.name,
            },
        ],
    },
  };
}


// Komponen Halaman Utama (tidak ada perubahan)
export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
    const product = await getProduct(params.slug);

    if (!product) {
        return <div className="text-center p-10"><h1>404</h1><p>Produk tidak ditemukan.</p></div>
    }

  return (
    <div className="container mx-auto p-4 md:p-8">
      {/* 3. Bungkus komponen dinamis Anda dengan Suspense */}
      <Suspense fallback={
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <ProductGallerySkeleton />
            <ProductDetailsSkeleton />
          </div>
        }>
        <ProductView initialProduct={product} />
      </Suspense>
    </div>
  );
}
