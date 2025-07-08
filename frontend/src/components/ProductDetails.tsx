'use client';

import { useState } from "react";
import { type Product } from "@/lib/types";
import { Star, Minus, Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import toast, { Toaster } from 'react-hot-toast';
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import NotifyStockButton from "./NotifyStockButton";
import Link from "next/link";

interface ProductDetailsProps {
  product: Product;
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  const router = useRouter();
  const { token, user } = useAuthStore();
  const { addToCart } = useCartStore();

  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  // Cek ketersediaan stok produk dari data yang diterima
  const isInStock = product.stock > 0;
  
  const handleAddToCart = async () => {
    if (!token) {
        toast.error("Silakan login untuk menambah ke keranjang.");
        router.push('/login');
        return;
    }
    if (!isInStock) {
      toast.error("Maaf, produk ini sedang habis.");
      return;
    }
    // PERBAIKAN: Validasi kuantitas vs stok di frontend sebelum mengirim ke API
    if (quantity > product.stock) {
      toast.error(`Maaf, stok hanya tersisa ${product.stock}.`);
      
      return;
    }

    setIsAdding(true);

    // Gunakan toast.promise untuk memberikan feedback otomatis (loading, sukses, error)
    await toast.promise(
      // Fungsi yang dijalankan
      addToCart(product.id, quantity),
      // Pesan untuk setiap status promise
      {
        loading: 'Menambahkan ke keranjang...',
        success: `Produk berhasil ditambahkan!`,
        // 'err' di sini adalah error yang dilempar dari cartStore
        error: (err) => err.message || 'Gagal menambahkan produk.',
      }
    );
    
    setIsAdding(false);
  };

  const rating = product.reviews_avg_rating || 0;
  const reviewsCount = product.reviews_count || 0;

  return (
    <div className="flex flex-col gap-6">
        <Toaster position="top-center" />
        <div>
            <h1 className="text-3xl lg:text-4xl font-bold">{product.name}</h1>

            {product.user && product.user.slug && (
                <p className="text-sm text-muted-foreground mt-2">
                    Dijual oleh: 
                    <Link href={`/toko/${product.user.slug}`} className="text-blue-600 hover:underline ml-1">
                        {product.user.name}
                    </Link>
                </p>
            )}
            
            <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mt-2">
                <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (<Star key={i} className={cn("w-5 h-5", i < Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300")}/>))}
                </div>
                <span className="text-sm text-muted-foreground">({reviewsCount} ulasan)</span>
                <Separator orientation="vertical" className="h-4 hidden sm:block" />

                {/* PERBAIKAN UTAMA: Menampilkan jumlah stok di dalam badge */}
                <Badge variant={isInStock ? "secondary" : "destructive"}>
                  {isInStock ? `Stok Tersedia (${product.stock})` : "Stok Habis"}
                </Badge>
            </div>
        </div>

        <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary">Rp {new Intl.NumberFormat('id-ID').format(product.price)}</span>
        </div>

        <p className="text-muted-foreground leading-relaxed">{product.description}</p>
        <Separator />

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">

            <div className="flex items-center gap-2 border rounded-md p-1">
                <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus className="w-4 h-4" /></Button>
                <span className="w-10 text-center font-semibold">{quantity}</span>
                {/* PERBAIKAN: Tombol tambah dibatasi oleh stok yang tersedia */}
                <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}><Plus className="w-4 h-4" /></Button>
            </div>

            <div className="flex-grow w-full">
                {user && user.role === 'customer' && (
                  <Button size="lg" variant="ghost-dark" className="w-full text-base outline" onClick={handleAddToCart} disabled={!isInStock || isAdding}>
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      {isAdding ? "Menambahkan..." : (isInStock ? "Tambah ke Keranjang" : "Stok Habis")}
                  </Button>
                )}
            </div>
        </div>
        {!isInStock && (
          <NotifyStockButton productId={product.id} />
          )}

    </div>
  );
}
