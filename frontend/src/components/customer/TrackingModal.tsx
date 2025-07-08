'use client';

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Loader2, CheckCircle } from "lucide-react";
import { type Product } from "@/lib/types";

// Definisikan tipe data untuk item pesanan yang diterima sebagai prop
interface OrderItem {
  id: number;
  product: Product;
  // Anda bisa tambahkan properti lain jika dibutuhkan
}

// Definisikan tipe data untuk setiap langkah dalam riwayat pelacakan
interface TrackingHistory {
  note: string;
  updated_at: string;
  status: string;
}

export default function TrackingModal({ orderItem }: { orderItem: OrderItem }) {
  const [history, setHistory] = useState<TrackingHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTracking = async () => {
      setIsLoading(true);
      setError(null);
      const token = Cookies.get('auth_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      
      if (!token) {
        setError("Anda harus login untuk melacak pesanan.");
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`${apiUrl}/api/tracking/order-items/${orderItem.id}`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json' 
          }
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Gagal melacak.');
        
        // PERBAIKAN: Akses 'history' langsung dari 'data', bukan 'data.data'
        setHistory(data.history || []); 
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTracking();
  }, [orderItem.id]);

  if (isLoading) return <div className="text-center p-8"><Loader2 className="animate-spin" /></div>;
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

  return (
    <div className="space-y-4 pt-4 max-h-80 overflow-y-auto">
      {history.length > 0 ? history.map((step, index) => (
        <div key={index} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${index === 0 ? 'bg-green-500' : 'bg-gray-300'}`}>
              <CheckCircle className="w-4 h-4 text-white"/>
            </div>
            {index < history.length - 1 && <div className="w-0.5 flex-1 bg-gray-300"></div>}
          </div>
          <div>
            <p className="font-semibold">{step.note}</p>
            <p className="text-xs text-gray-500">{new Date(step.updated_at).toLocaleString('id-ID')}</p>
          </div>
        </div>
      )) : (
        <p className="text-center text-gray-500">Riwayat pelacakan tidak ditemukan atau belum tersedia.</p>
      )}
    </div>
  );
}
