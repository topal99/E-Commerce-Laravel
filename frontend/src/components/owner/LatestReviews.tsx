// frontend/src/components/owner/LatestReviews.tsx

'use client';

import { useEffect, useState, useCallback } from 'react';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { Star } from 'lucide-react';

// Definisikan tipe data untuk ulasan
interface Review {
  id: number;
  rating: number;
  comment: string;
  user: { name: string };
  product: { name: string };
}

export default function LatestReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fungsi untuk mengambil data ulasan
  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    const token = Cookies.get('auth_token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    try {
      const res = await fetch(`${apiUrl}/api/owner/reviews`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      });
      if (!res.ok) throw new Error("Gagal memuat ulasan terbaru.");
      const data = await res.json();
      setReviews(data.data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <Star className="w-6 h-6 text-yellow-500" />
        Ulasan Terbaru
      </h2>
      {isLoading ? (
        <p className="text-sm text-gray-500">Memuat ulasan...</p>
      ) : (
        <ul className="space-y-4">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <li key={review.id} className="border-t pt-4 first:border-t-0 first:pt-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{review.product.name}</p>
                    <p className="text-sm text-gray-500">
                      oleh {review.user.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="font-bold">{review.rating}</span>
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  </div>
                </div>
                {review.comment && (
                  <p className="text-gray-700 mt-2 italic bg-gray-50 p-2 rounded">"{review.comment}"</p>
                )}
              </li>
            ))
          ) : (
            <p className="text-sm text-gray-500">Belum ada ulasan untuk produk Anda.</p>
          )}
        </ul>
      )}
    </div>
  );
}