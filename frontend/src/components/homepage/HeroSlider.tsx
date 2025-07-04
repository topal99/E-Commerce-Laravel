'use client';

import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';

interface Banner {
  image_url: string;
  title: string;
  subtitle: string;
  link: string;
}

export default function HeroSlider({ banners }: { banners: Banner[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 2000, stopOnInteraction: false }),
  ]);

  // State untuk menyimpan indeks slide yang sedang terpilih
  const [selectedIndex, setSelectedIndex] = useState(0);
  // State untuk menyimpan total jumlah slide
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  // Fungsi untuk berpindah ke slide yang diklik
  const scrollTo = useCallback((index: number) => {
    emblaApi?.scrollTo(index);
  }, [emblaApi]);

  // Fungsi yang akan dijalankan setiap kali carousel memilih slide baru
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  // useEffect untuk setup awal dan mendaftarkan event listener
  useEffect(() => {
    if (!emblaApi) return;
    
    // Ambil jumlah slide dan simpan di state
    setScrollSnaps(emblaApi.scrollSnapList());
    
    // Dengarkan event 'select' untuk tahu kapan slide berubah
    emblaApi.on('select', onSelect);
    // Dengarkan event 'reInit' untuk setup ulang jika ada perubahan
    emblaApi.on('reInit', onSelect);

    // Set slide yang aktif saat pertama kali load
    onSelect();

    // Fungsi cleanup untuk membersihkan listener
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className="overflow-hidden relative" ref={emblaRef}>
      <div className="flex">
        {banners.map((banner, index) => (
          <div className="relative flex-[0_0_100%] h-[50vh] md:h-[80vh]" key={index}>
            <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <div className="text-center text-white p-4">
                <h1 className="text-3xl md:text-6xl font-bold">{banner.title}</h1>
                <p className="mt-4 text-lg md:text-2xl">{banner.subtitle}</p>
                <Link href={banner.link} className="mt-8 inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded">
                  Shop Now
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* BAGIAN NAVIGASI TITIK (DOTS) */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center space-x-3">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            // Beri gaya berbeda jika dot ini adalah dot yang aktif
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === selectedIndex ? 'bg-white scale-125' : 'bg-white/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}