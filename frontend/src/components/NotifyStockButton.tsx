'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Mail, Loader2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';

interface NotifyStockButtonProps {
  productId: number;
}

export default function NotifyStockButton({ productId }: NotifyStockButtonProps) {
  const { token } = useAuthStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = async () => {
    if (!token) {
      toast.error("Silakan login untuk mendapatkan notifikasi.");
      router.push('/login');
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Mendaftarkan Anda...");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    try {
      const res = await fetch(`${apiUrl}/api/products/${productId}/stock-notification`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      toast.success(data.message, { id: toastId });
      setIsSubscribed(true); // Ubah state tombol menjadi sudah terdaftar
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubscribed) {
    return (
      <div className="flex items-center gap-2 text-green-600 font-semibold p-3 bg-green-50 rounded-md">
        <CheckCircle className="w-5 h-5" />
        <span>Terima kasih! Anda akan kami beri tahu.</span>
      </div>
    );
  }

  return (
    <Button variant="ghost-dark" size="lg" className="w-full text-base outline" onClick={handleSubscribe} disabled={isLoading}>
      {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Mail className="mr-2 h-5 w-5" />}
      Beri Tahu Saya Jika Tersedia
    </Button>
  );
}
