'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';

export default function FilterSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Ambil nilai filter saat ini dari URL
  const currentSort = searchParams.get('sort') || 'latest';
  const currentMaxPrice = Number(searchParams.get('max_price')) || 5000000;

  // Fungsi untuk membuat query string baru
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  return (
    <div className="space-y-8">
      {/* Filter Urutkan */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Urutkan</h3>
        <RadioGroup
          defaultValue={currentSort}
          onValueChange={(value) => {
            router.push(pathname + '?' + createQueryString('sort', value));
          }}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="latest" id="sort-latest" />
            <Label htmlFor="sort-latest">Terbaru</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="price_asc" id="sort-price-asc" />
            <Label htmlFor="sort-price-asc">Harga Terendah</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="price_desc" id="sort-price-desc" />
            <Label htmlFor="sort-price-desc">Harga Tertinggi</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="rating" id="sort-rating" />
            <Label htmlFor="sort-rating">Rating Tertinggi</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Filter Harga */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Harga Maksimal</h3>
        <Slider
          defaultValue={[currentMaxPrice]}
          max={5000000}
          step={100000}
          onValueChange={(value) => {
            router.push(pathname + '?' + createQueryString('max_price', value[0].toString()));
          }}
        />
        <div className="flex justify-between text-sm text-muted-foreground mt-2">
          <span>Rp 0</span>
          <span>Rp {new Intl.NumberFormat('id-ID').format(currentMaxPrice)}</span>
        </div>
      </div>
    </div>
  );
}
