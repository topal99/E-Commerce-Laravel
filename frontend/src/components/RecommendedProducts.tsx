import { type Product } from "@/lib/types";
import ProductCarouselClient from "./homepage/ProductCarouselClient"; // Kita gunakan kembali komponen carousel

// Fungsi untuk mengambil data rekomendasi dari API
async function getRecommendations(productId: number): Promise<Product[]> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    try {
        const res = await fetch(`${apiUrl}/api/products/${productId}/recommendations`, {
            next: { revalidate: 3600 } // Cache hasil selama 1 jam
        });
        if (!res.ok) return [];
        
        const data = await res.json();
        return data.data || []; 
    } catch (error) {
        console.error("Gagal memuat rekomendasi:", error);
        return [];
    }
}

// Ini adalah Server Component yang mengambil data
export default async function RecommendedProducts({ productId }: { productId: number }) {
    const recommendedProducts = await getRecommendations(productId);

    // Jika tidak ada produk rekomendasi, jangan tampilkan apa-apa
    if (recommendedProducts.length === 0) {
        return null;
    }

    return (
        <section className="py-12 md:py-16 bg-gray-50">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-8">Anda Mungkin Juga Suka</h2>
                {/* Kita teruskan data ke komponen klien yang menangani interaksi carousel */}
                <ProductCarouselClient products={recommendedProducts} />
            </div>
        </section>
    );
}
