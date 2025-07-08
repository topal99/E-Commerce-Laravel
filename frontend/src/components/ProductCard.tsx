'use client';

import { useRouter } from "next/navigation";
import Image from "next/image";
import { type Product } from "@/lib/types";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/authStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import toast from "react-hot-toast";
import { Heart, ShoppingCart, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();

  const { addToCart } = useCartStore();
  const { token, user } = useAuthStore();
  const { wishlistedProductIds, toggleWishlist } = useWishlistStore(); // <-- Ambil state & fungsi wishlist
  
  // State lokal untuk UI yang reaktif
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Sinkronkan status wishlist lokal dengan state global
  useEffect(() => {
    setIsWishlisted(wishlistedProductIds.has(product.id));
  }, [wishlistedProductIds, product.id]);


  const handleCardClick = () => {
    router.push(`/products/${product.slug}`);
  };

  const handleAddToCartClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!token) {
      toast.error('Silakan login untuk menambah ke keranjang.');
      router.push('/login');
      return;
    }
    addToCart(product.id)
      .then(() => { toast.success(`"${product.name}" ditambahkan ke keranjang!`); })
      .catch(() => { toast.error("Gagal menambah ke keranjang."); });
  };

  const handleWishlistClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!token) {
      toast.error('Silakan login untuk mengatur wishlist.');
      router.push('/login');
      return;
    }
    
    // Panggil fungsi toggle dari store, biarkan store yang handle API & state
    toast.promise(
        toggleWishlist(product.id),
        {
          loading: 'Memperbarui wishlist...',
          success: (res) => `Produk berhasil ditambahkan/dihapus!`,
          error: 'Gagal memperbarui wishlist.',
        }
    );
  };
  
  // Gunakan data baru dari API dengan fallback
  // Backend mengirim 'reviews_avg_rating' dan 'reviews_count'
  const rating = product.reviews_avg_rating || 0;
  const reviewsCount = product.reviews_count || 0;
  const categoryName = product.category?.name || 'Uncategorized';
  const imageUrl = `${process.env.NEXT_PUBLIC_API_URL}/storage/${product.image_url}`;

  return (
    <Card
      className="group overflow-hidden rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col cursor-pointer"
      onClick={handleCardClick}
    >
      <CardContent className="p-0 flex-grow flex flex-col">
        <div className="relative">
          <Image src={imageUrl} alt={product.name} width={400} height={400} className="object-cover aspect-square w-full group-hover:opacity-75" />
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            
            {/* { {product.isNew && <Badge>Baru</Badge>}
            {product.onSale && (
              <Badge variant="destructive">
                {product.originalPrice ? `${Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%` : "Diskon"}
              </Badge>
            )} } */}

          </div>
          <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button size="icon" variant="secondary" className="rounded-full w-9 h-9" onClick={handleWishlistClick}>
              <Heart className={`w-4 h-4 transition-all ${isWishlisted ? 'text-red-500 fill-red-500' : 'text-gray-500'}`} />
            </Button>
          </div>
        </div>
        <div className="p-4 flex-grow flex flex-col">
          <p className="text-sm text-muted-foreground">{categoryName}</p>
          <h3 className="font-semibold leading-tight mt-1 flex-grow">{product.name}</h3>
          <div className="flex items-center gap-1 mt-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-4 h-4 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/50"}`} />
            ))}
            <span className="text-xs text-muted-foreground ml-1">({reviewsCount})</span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-xl font-bold text-primary">Rp {new Intl.NumberFormat('id-ID').format(product.price)}</p>
            {product.originalPrice && (
              <p className="text-sm text-muted-foreground line-through">Rp {new Intl.NumberFormat('id-ID').format(product.originalPrice)}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
