    import ProductCard from "@/components/ProductCard";
    import { type Product } from "@/lib/types";

    async function searchProducts(query: string): Promise<Product[]> {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        try {
            // Encode query untuk keamanan URL
            const res = await fetch(`${apiUrl}/api/products/search?q=${encodeURIComponent(query)}`, { cache: 'no-store' });
            if (!res.ok) return [];
            const data = await res.json();
            return data.data;
        } catch (error) {
            return [];
        }
    }

    export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
        const query = searchParams.q || "";
        const products = await searchProducts(query);

        return (
            <div className="container mx-auto p-4 md:p-8">
                <h1 className="text-3xl font-bold mb-2">Hasil Pencarian untuk: "{query}"</h1>
                <p className="text-muted-foreground mb-8">Menemukan {products.length} produk.</p>

                {products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-12 border rounded-lg">
                        <p className="text-lg">Produk tidak ditemukan.</p>
                    </div>
                )}
            </div>
        );
    }
    