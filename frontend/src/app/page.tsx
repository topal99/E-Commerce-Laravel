import { type Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";
import PaginationControls from "@/components/PaginationControls";
import { Separator } from "@/components/ui/separator";

// Import semua komponen untuk section di Homepage
import BestSellingProducts from "@/components/BestSellingProducts";
import HeroSlider from "@/components/homepage/HeroSlider";
import CategoryShowcase from "@/components/homepage/CategoryShowcase";

// Definisikan tipe untuk respons paginasi dari API
interface PaginatedResponse {
  current_page: number;
  data: Product[];
  last_page: number;
  next_page_url: string | null;
  prev_page_url: string | null;
}

// Fungsi ini HANYA mengambil data produk terbaru yang terpaginasi
async function getLatestProducts(page: number): Promise<PaginatedResponse | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  try {
    const res = await fetch(`${apiUrl}/api/products?page=${page}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Gagal memuat produk terbaru:", error);
    return null;
  }
}

// Fungsi ini HANYA mengambil data statis homepage lainnya
async function getHomepageData() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    try {
        const res = await fetch(`${apiUrl}/api/homepage`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Gagal memuat data homepage');
        const data = await res.json();
        // Kita tidak butuh best_sellers dari sini karena sudah diambil oleh komponennya sendiri
        return { 
            banners: data.data.banners || [], 
            featured_categories: data.data.featured_categories || [], 
            testimonials: data.data.testimonials || [] 
        };
    } catch (error) {
        console.error(error);
        return { banners: [], featured_categories: [], testimonials: [] };
    }
}


export default async function HomePage({ searchParams }: { searchParams: { page?: string } }) {
  // Ambil nomor halaman dari URL, defaultnya 1 jika tidak ada
  const currentPage = Number(searchParams.page) || 1;
  
  // Ambil data untuk bagian yang berbeda secara bersamaan
  const [productsResponse, homepageData] = await Promise.all([
    getLatestProducts(currentPage),
    getHomepageData()
  ]);

  return (
    <main>
      {/* Bagian 1: Hero Slider (Carousel) */}
      <HeroSlider banners={homepageData.banners} />
      
      {/* Bagian 2: Kategori Pilihan */}
      <CategoryShowcase categories={homepageData.featured_categories} />
      
      {/* Bagian 3: Produk Terlaris (Carousel) - Komponen ini mengambil datanya sendiri */}
      <BestSellingProducts />
      
      <Separator className="my-12" />

      {/* Bagian 4: Produk Terbaru (Grid + Paginasi) */}
      <section className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Jelajahi Produk Kami</h2>
        
        {productsResponse && productsResponse.data.length > 0 ? (
          <>
            {/* Tampilan Grid Produk */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {productsResponse.data.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Kontrol Paginasi di Bawah Grid */}
            <PaginationControls
              currentPage={productsResponse.current_page}
              lastPage={productsResponse.last_page}
              hasNextPage={!!productsResponse.next_page_url}
              hasPrevPage={!!productsResponse.prev_page_url}
            />
          </>
        ) : (
          <p className="text-center text-muted-foreground">Tidak dapat memuat produk.</p>
        )}
      </section>
      <Separator className="my-8" />

    </main>
  );
}
