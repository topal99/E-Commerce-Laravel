'use client';

import { type Product, type Review } from "@/lib/types";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import ReviewForm from "./ReviewForm";
import { useAuthStore } from "@/stores/authStore";

// PERBAIKAN UTAMA DI SINI:
// Fungsi onReviewSubmitted sekarang akan menerima objek Product yang sudah diperbarui
interface ReviewSectionProps {
    product: Product;
    onReviewSubmitted: (updatedProduct: Product) => void; 
}

export default function ReviewSection({ product, onReviewSubmitted }: ReviewSectionProps) {
    const { user } = useAuthStore();
    const rating = product.reviews_avg_rating || 0;
    const reviews = product.reviews || [];

    const hasUserReviewed = user ? reviews.some(review => review.user.id === user.id) : false;

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Ulasan & Rating ({product.reviews_count || 0})</h2>
            <div className="flex items-center gap-2 mb-6">
                <p className="text-4xl font-bold">{rating.toFixed(1)}</p>
                <div className="flex flex-col">
                    <div className="flex">
                        {[...Array(5)].map((_, i) => (<Star key={i} className={cn("w-5 h-5", i < Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300")}/>))}
                    </div>
                    <p className="text-sm text-muted-foreground">Berdasarkan {product.reviews_count || 0} ulasan</p>
                </div>
            </div>

            <div className="mb-8">
                {user && user.role === 'customer' && !hasUserReviewed && (
                    // Sekarang kita meneruskan fungsi dengan tipe yang benar
                    <ReviewForm productId={product.id} onReviewSubmitted={onReviewSubmitted} />
                )}
                {hasUserReviewed && (
                    <div className="p-4 border rounded-lg bg-green-50 text-green-700">
                        <p className="font-semibold">Terima kasih, Anda sudah memberikan ulasan untuk produk ini.</p>
                    </div>
                )}
            </div>
            
            <div className="space-y-6">
                {reviews.length > 0 ? reviews.map((review: Review) => (
                    <div key={review.id} className="border-t pt-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="font-semibold">{review.user.name}</p>
                            <div className="flex">
                                {[...Array(5)].map((_, i) => (<Star key={i} className={cn("w-4 h-4", i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300")}/>))}
                            </div>
                        </div>
                        {review.comment && review.comment.trim() !== '' ? (
                            <p className="text-gray-600 italic">"{review.comment}"</p>
                        ) : (
                            <p className="text-gray-400 italic">Pengguna ini tidak memberikan komentar.</p>
                        )}
                    </div>
                )) : (
                    <div className="text-center py-8 text-gray-500">
                        <p>Belum ada ulasan untuk produk ini.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
