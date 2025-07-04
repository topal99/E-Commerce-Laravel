import ProductCard from "@/components/ProductCard";
import { type Product } from "@/lib/types";

// Fungsi untuk mengambil data kategori dan produknya dari API
async function getCategoryData(slug: string) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    try {
        const res = await fetch(`${apiUrl}/api/categories/${slug}`, { cache: 'no-store' });
        if (!res.ok) return null; // Jika kategori tidak ditemukan, kembalikan null
        
        const data = await res.json();
        return data.data;
    } catch (error) {
        console.error("Failed to fetch category data:", error);
        return null;
    }
}

// Ini adalah Server Component, karena itu bisa 'async'
export default async function CategoryPage({ params }: { params: { slug: string } }) {
    const categoryData = await getCategoryData(params.slug);

    // Tampilkan pesan jika kategori tidak ditemukan
    if (!categoryData) {
        return (
            <div className="container mx-auto text-center p-8">
                <h1 className="text-4xl font-bold">404 - Category Not Found</h1>
                <p className="mt-4">The category you are looking for does not exist.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-8">
            {/* Header Halaman */}
            <div className="mb-8">
                <p className="text-sm text-gray-500">Showing products for:</p>
                <h1 className="text-4xl font-bold capitalize">{categoryData.name}</h1>
            </div>

            {/* Grid untuk menampilkan produk */}
            {categoryData.products && categoryData.products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {categoryData.products.map((product: Product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="text-center p-12 border rounded-lg">
                    <p className="text-lg">No products found in this category yet.</p>
                </div>
            )}
        </div>
    );
}
