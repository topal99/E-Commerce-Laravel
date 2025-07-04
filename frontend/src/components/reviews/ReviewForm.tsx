'use client';

import { useState } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Star } from "lucide-react";
import toast, { Toaster } from 'react-hot-toast';
import Cookies from "js-cookie";
import { useAuthStore } from "@/stores/authStore";
import { type Product } from "@/lib/types"; // Import tipe Product

// PERBAIKAN UTAMA DI SINI:
// Fungsi onReviewSubmitted sekarang akan menerima objek Product baru
interface ReviewFormProps {
    productId: number;
    onReviewSubmitted: (updatedProduct: Product) => void; 
}

export default function ReviewForm({ productId, onReviewSubmitted }: ReviewFormProps) {
    const { user } = useAuthStore();
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error("Silakan berikan rating bintang terlebih dahulu.");
            return;
        }
        setIsSubmitting(true);
        const token = Cookies.get('auth_token');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        try {
            const res = await fetch(`${apiUrl}/api/products/${productId}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ rating, comment }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            
            toast.success("Terima kasih atas ulasan Anda!");
            
            // Panggil fungsi "penyegar" dengan membawa data produk baru dari respons API
            onReviewSubmitted(data.data);
            
            // Reset form setelah berhasil
            setRating(0);
            setComment("");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user || user.role !== 'customer') return null;

    return (
        <div className="p-4 border rounded-lg bg-gray-50">
            <Toaster />
            <h3 className="font-semibold mb-2">Tulis Ulasan Anda</h3>
            <div className="flex items-center mb-4">
                {[1, 2, 3, 4, 5].map(star => (
                    <Star
                        key={star}
                        className="w-6 h-6 cursor-pointer"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        color={star <= (hoverRating || rating) ? "#f59e0b" : "#e5e7eb"}
                        fill={star <= (hoverRating || rating) ? "#f59e0b" : "none"}
                    />
                ))}
            </div>
            <Textarea 
                placeholder="Bagikan pengalaman Anda tentang produk ini..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="mb-4"
            />
            <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Mengirim..." : "Kirim Ulasan"}
            </Button>
        </div>
    );
}
