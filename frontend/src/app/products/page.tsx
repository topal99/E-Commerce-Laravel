import { type Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";
import PaginationControls from "@/components/PaginationControls";
import FilterSidebar from "@/components/products/FilterSidebar"; // Kita akan gunakan ini juga

// Definisikan tipe untuk respons paginasi dari API
interface PaginatedResponse {
  current_page: number;
  data: Product[];
  last_page: number;
  next_page_url: string | null;
  prev_page_url: string | null;
}

// Fungsi ini sekarang menerima semua parameter dari URL untuk dikirim ke API
async function getProducts(searchParams: { [key: string]: string | string[] | undefined }): Promise<PaginatedResponse | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  // Buat query string dari searchParams (misal: page=2&sort=price_asc)
  const query = new URLSearchParams(searchParams as any).toString();
  
  try {
    const res = await fetch(`${apiUrl}/api/products?${query}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Gagal memuat produk:", error);
    return null;
  }
}

export default async function ProductsPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const productsResponse = await getProducts(searchParams);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold">Semua Produk</h1>
        <p className="text-lg text-muted-foreground mt-2">Temukan semua yang Anda butuhkan di sini.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Kolom Sidebar untuk Filter */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24 bg-white p-6 rounded-lg shadow-md">
            <FilterSidebar />
          </div>
        </aside>

        {/* Kolom Utama untuk Daftar Produk */}
        <main className="lg:col-span-3">
          {productsResponse && productsResponse.data.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {productsResponse.data.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Tampilkan kontrol paginasi di bawah grid */}
              <PaginationControls
                currentPage={productsResponse.current_page}
                lastPage={productsResponse.last_page}
                hasNextPage={!!productsResponse.next_page_url}
                hasPrevPage={!!productsResponse.prev_page_url}
              />
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg">Tidak ada produk yang cocok dengan filter Anda.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}