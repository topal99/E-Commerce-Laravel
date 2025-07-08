import { type Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";
import PaginationControls from "@/components/PaginationControls";
import { Star, Package, ShoppingBag } from "lucide-react";
import StoreSearchBar from "@/components/toko/StoreSearchBar";

interface StoreData {
  store: {
    name: string;
    bio: string;
    stats: {
      total_products: number;
      total_sales: number;
      average_rating: number;
    };
  };
  products: {
    current_page: number;
    data: Product[];
    last_page: number;
    next_page_url: string | null;
    prev_page_url: string | null;
  };
}

async function getStoreData(slug: string, searchParams: { [key: string]: string | undefined }): Promise<StoreData | null> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const query = new URLSearchParams(searchParams as any).toString();
    try {
        const res = await fetch(`${apiUrl}/api/toko/${slug}?${query}`, { cache: 'no-store' });
        if (!res.ok) return null;
        return await res.json();
    } catch (error) {
        return null;
    }
}

export default async function StorePage({ params, searchParams }: { params: { slug: string }, searchParams: { [key: string]: string | undefined } }) {
    const data = await getStoreData(params.slug, searchParams);

    if (!data) {
        return <div className="text-center p-10"><h1>404</h1><p>Toko tidak ditemukan.</p></div>
    }

    const { store, products } = data;

    return (
        <div className="container mx-auto p-4 md:p-8">
            {/* Header Toko */}
            <div className="bg-white p-8 rounded-lg shadow-md mb-8 text-center">
                <h1 className="text-4xl font-bold">{store.name}</h1>
                <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">{store.bio}</p>
                <div className="mt-6 flex justify-center gap-8 text-sm">
                    <div className="flex items-center gap-2"><Star className="w-4 h-4 text-yellow-500" /> {store.stats.average_rating || 'N/A'} Rating</div>
                    <div className="flex items-center gap-2"><Package className="w-4 h-4 text-blue-500" /> {store.stats.total_products} Produk</div>
                    <div className="flex items-center gap-2"><ShoppingBag className="w-4 h-4 text-green-500" /> {store.stats.total_sales} Terjual</div>
                </div>
            </div>

            {/* Search Bar & Daftar Produk */}
            <div className="space-y-6">
                <StoreSearchBar />
                {products.data.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {products.data.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                        <PaginationControls
                            currentPage={products.current_page}
                            lastPage={products.last_page}
                            hasNextPage={!!products.next_page_url}
                            hasPrevPage={!!products.prev_page_url}
                        />
                    </>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-lg">Tidak ada produk yang cocok dengan pencarian Anda.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
