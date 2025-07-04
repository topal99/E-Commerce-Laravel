'use client';

import useEmblaCarousel from 'embla-carousel-react';
import { type Product } from '@/lib/types';
import ProductCard from '@/components/ProductCard';

interface ProductCarouselClientProps {
    products: Product[];
}

export default function ProductCarouselClient({ products }: ProductCarouselClientProps) {
    // Hook untuk menginisialisasi carousel
    const [emblaRef] = useEmblaCarousel({ 
        slidesToScroll: 1, 
        align: 'start', 
        containScroll: 'trimSnaps' 
    });

    return (
        <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex -ml-4">
                {products.map((product) => (
                    // Setiap slide sekarang berisi komponen ProductCard
                    <div 
                        className="flex-[0_0_80%] sm:flex-[0_0_50%] md:flex-[0_0_33.33%] lg:flex-[0_0_25%] pl-4" 
                        key={product.id}
                    >
                        <ProductCard product={product} />
                    </div>
                ))}
            </div>
        </div>
    );
}
