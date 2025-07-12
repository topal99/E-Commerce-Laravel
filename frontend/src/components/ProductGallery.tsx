'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import { type Product } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ProductGalleryProps {
  product: Product;
}

export default function ProductGallery({ product }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mainApi, setMainApi] = useState<any>(null);
  const [thumbApi, setThumbApi] = useState<any>(null);

  // Gabungkan gambar utama dengan gambar galeri
  const slides = [
    { id: 0, image_url: product.image_url }, 
    ...(product.images || [])
  ];

  const [mainRef, emblaMainApi] = useEmblaCarousel({ loop: true });
  const [thumbRef, emblaThumbApi] = useEmblaCarousel({
    containScroll: 'keepSnaps',
    dragFree: true,
  });

  const onThumbClick = useCallback((index: number) => {
    if (!emblaMainApi || !emblaThumbApi) return;
    emblaMainApi.scrollTo(index);
  }, [emblaMainApi, emblaThumbApi]);

  const onSelect = useCallback(() => {
    if (!emblaMainApi || !emblaThumbApi) return;
    setSelectedIndex(emblaMainApi.selectedScrollSnap());
    emblaThumbApi.scrollTo(emblaMainApi.selectedScrollSnap());
  }, [emblaMainApi, emblaThumbApi, setSelectedIndex]);

  useEffect(() => {
    if (!emblaMainApi) return;
    onSelect();
    emblaMainApi.on('select', onSelect);
    emblaMainApi.on('reInit', onSelect);
  }, [emblaMainApi, onSelect]);

  return (
    <div className="space-y-4">
      {/* Gambar Utama dengan Efek Zoom */}
      <div className="overflow-hidden rounded-lg group">
        <div className="relative h-96 lg:h-[500px]" ref={mainRef}>
          <div className="flex h-full">
            {slides.map((slide) => (
              <div className="relative flex-[0_0_100%] h-full" key={slide.id}>
                <Image
                  src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${slide.image_url}`}
                  alt={product.name}
                  fill
                  className="object-contain transition-transform duration-500 ease-in-out group-hover:scale-110"
                  sizes="(max-width: 1024px) 90vw, 45vw"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Thumbnail Carousel */}
      <div className="overflow-hidden" ref={thumbRef}>
        <div className="flex -ml-2">
          {slides.map((slide, index) => (
            <div className="flex-[0_0_25%] sm:flex-[0_0_20%] pl-2" key={slide.id}>
              <button onClick={() => onThumbClick(index)} className="block w-full aspect-square relative rounded-md overflow-hidden">
                <Image
                  src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${slide.image_url}`}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className={cn(
                    "object-cover transition-opacity",
                    index === selectedIndex ? 'opacity-100' : 'opacity-50 hover:opacity-100'
                  )}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
