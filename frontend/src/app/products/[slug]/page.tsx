import { type Product } from "@/lib/types";
import ProductView from "@/components/ProductView";

async function getProduct(slug: string): Promise<Product | null> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    try {
        // PERBAIKAN UTAMA: Tambahkan { cache: 'no-store' }
        // Ini memaksa Next.js untuk selalu mengambil data baru dari API setiap kali
        // halaman ini diminta, baik saat navigasi maupun saat refresh.
        const res = await fetch(`${apiUrl}/api/products/${slug}`, { cache: 'no-store' });
        
        if (!res.ok) return null;
        const data = await res.json();
        return data.data;
    } catch (error) {
        console.error("Gagal memuat produk:", error);
        return null;
    }
}

// Komponen ini tetap menjadi Server Component yang bersih
export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
    const product = await getProduct(params.slug);

    if (!product) {
        return <div className="text-center p-10"><h1>404</h1><p>Produk tidak ditemukan.</p></div>
    }

    return (
        <div className="container mx-auto p-4 md:p-8">
            {/* Render komponen klien dengan data awal yang dijamin selalu baru */}
            <ProductView initialProduct={product} />
        </div>
    );
}
