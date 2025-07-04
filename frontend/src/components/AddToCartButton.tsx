// src/components/AddToCartButton.tsx
'use client';

import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Tipe data untuk prop 'product' sekarang hanya butuh id
interface ProductData {
    id: number;
}

export default function AddToCartButton({ product }: { product: ProductData }) {
    const addToCart = useCartStore(state => state.addToCart);
    const { token } = useAuthStore();
    const { user } = useAuthStore();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleAddToCart = async () => {
        if (!token) {
            alert('Please login to add items to your cart.');
            router.push('/login?redirect=' + window.location.pathname);
            return;
        }

        setIsLoading(true);
        try {
            // Panggil fungsi async dari store yang hanya butuh product.id
            await addToCart(product.id);
            alert('Product added to cart!');
        } catch (error) {
            console.error(error);
            alert('Failed to add product to cart.');
        } finally {
            setIsLoading(false);
        }
    };

    // Jika user adalah admin atau owner, jangan tampilkan tombol sama sekali
    if (user && user.role !== 'customer') {
        return null;
    }

    return (
        <button 
            onClick={handleAddToCart}
            disabled={isLoading}
            className="w-full bg-blue-500 text-white font-bold py-3 px-4 rounded hover:bg-blue-600 transition-colors disabled:bg-blue-300"
        >
            {isLoading ? 'Adding...' : 'Add to Cart'}
        </button>
    );
}