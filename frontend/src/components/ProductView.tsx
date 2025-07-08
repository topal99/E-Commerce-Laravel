'use client';

import { useState, useCallback } from "react";
import { type Product } from "@/lib/types";
import ProductDetails from "./ProductDetails";
import ReviewSection from "./reviews/ReviewSection";
import { Separator } from "./ui/separator";
import toast, { Toaster } from "react-hot-toast";
import Image from "next/image";
import InfoTabs from "./InfoTabs";

interface ProductViewProps {
  initialProduct: Product;
}

export default function ProductView({ initialProduct }: ProductViewProps) {
  const [product, setProduct] = useState(initialProduct);

  const refreshProductData = useCallback(async () => {
    const toastId = toast.loading("Memuat ulasan terbaru...");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    try {
      // Karena cache sudah dimatikan di level halaman, fetch ini juga akan selalu baru
      const res = await fetch(`${apiUrl}/api/products/${product.slug}`, { cache: 'no-store' });
      if (!res.ok) throw new Error("Gagal memuat ulang data produk.");
      
      const data = await res.json();
      setProduct(data.data);
      toast.success("Tampilan diperbarui!", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat ulang ulasan.", { id: toastId });
    }
  }, [product.slug]);

  const imageUrl = `${process.env.NEXT_PUBLIC_API_URL}/storage/${product.image_url}`;

  return (
    <>
      <Toaster position="top-center" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <div className="relative aspect-square w-full">
          <Image src={imageUrl} alt={product.name} width={400} height={400} className="object-cover aspect-square w-full group-hover:opacity-75" />
          </div>
        <div>
          <ProductDetails product={product} />
        </div>
      </div>

      <Separator className="my-12" />
            
      <InfoTabs product={product} onInfoSubmitted={refreshProductData} />
    </>
  );
}
