'use client';

import Link from 'next/link';
import { Loader2 } from 'lucide-react';

// Tipe data untuk setiap saran
interface Suggestion {
  name: string;
  slug: string;
}

// Komponen sekarang menerima prop isLoading
interface SearchSuggestionsProps {
  suggestions: Suggestion[];
  isLoading: boolean;
  onSuggestionClick: () => void;
}

export default function SearchSuggestions({ suggestions, isLoading, onSuggestionClick }: SearchSuggestionsProps) {
  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
      {isLoading ? (
        // Tampilkan ikon loading jika sedang mencari
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : suggestions.length > 0 ? (
        // Tampilkan daftar jika ada hasil
        <ul className="divide-y">
          {suggestions.map((suggestion) => (
            <li key={suggestion.slug}>
              <Link 
                href={`/products/${suggestion.slug}`} 
                className="block p-3 hover:bg-accent text-sm font-medium"
                onClick={onSuggestionClick}
              >
                {suggestion.name}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        // Tampilkan pesan jika tidak ada hasil
        <p className="p-4 text-sm text-muted-foreground">Produk tidak ditemukan.</p>
      )}
    </div>
  );
}