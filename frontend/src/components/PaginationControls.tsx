'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationControlsProps {
  currentPage: number;
  lastPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function PaginationControls({ currentPage, lastPage, hasNextPage, hasPrevPage }: PaginationControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    // Ambil semua query parameter yang sudah ada (misalnya untuk filter)
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    // Set atau update parameter 'page'
    current.set('page', page.toString());
    
    // Buat query string baru
    const query = current.toString();
    
    // Arahkan ke halaman dengan query baru, menggunakan path saat ini
    router.push(`${pathname}?${query}`);
  };

  return (
    <div className="flex items-center justify-center gap-4 mt-8">
      <Button
        variant="outline"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={!hasPrevPage}
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Previous
      </Button>

      <span className="text-sm font-medium">
        Halaman {currentPage} dari {lastPage}
      </span>

      <Button
        variant="outline"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={!hasNextPage}
      >
        Next
        <ChevronRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
}