import { type Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";
import ProductCarouselClient from "@/components/homepage/ProductCarouselClient"; // Kita akan gunakan komponen klien untuk carousel

// Fungsi untuk mengambil data produk terlaris dari API homepage
async function getBestSellingProducts(): Promise<Product[]> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    try {
        const res = await fetch(`${apiUrl}/api/homepage`, { cache: 'no-store' });
        if (!res.ok) return [];
        
        const data = await res.json();
        // Ambil hanya bagian 'best_sellers' dari respons
        return data.data.best_sellers || []; 
    } catch (error) {
        console.error("Gagal memuat produk terlaris:", error);
        return [];
    }
}

// Ini adalah Server Component yang mengambil data
export default async function BestSellingProducts() {
    const products = await getBestSellingProducts();

    if (products.length === 0) {
        return null; // Jika tidak ada produk terlaris, jangan tampilkan apa-apa
    }

    return (
        <section className="py-12 md:py-16 bg-blue-50">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-8">Paling Laris</h2>
                {/* Kita teruskan data ke komponen klien yang menangani interaksi carousel */}
                <ProductCarouselClient products={products} />
            </div>
        </section>
    );
}
