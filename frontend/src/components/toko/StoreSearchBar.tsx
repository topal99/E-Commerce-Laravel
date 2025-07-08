'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Input } from '../ui/input';
import { Search } from 'lucide-react';

export default function StoreSearchBar() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentQuery = searchParams.get('q') || '';

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const searchQuery = formData.get('q') as string;

        const current = new URLSearchParams(Array.from(searchParams.entries()));
        current.set('q', searchQuery);
        current.set('page', '1'); // Selalu kembali ke halaman 1 saat pencarian baru
        
        router.push(`${pathname}?${current.toString()}`);
    };

    return (
        <form onSubmit={handleSearch} className="relative max-w-sm mx-auto">
            <Input
                type="search"
                name="q"
                defaultValue={currentQuery}
                placeholder="Cari di dalam toko ini..."
                className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        </form>
    );
}
