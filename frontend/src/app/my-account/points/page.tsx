'use client';

import { useEffect, useState, useCallback } from 'react';
import Cookies from 'js-cookie';
import toast, { Toaster } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { Gift, Award, Loader2 } from 'lucide-react';

interface PointHistory {
   id: number;
  points_change: number;
  description: string;
  created_at: string;
}

export default function PointsCenterPage() {
  const { user, updateUserPoints } = useAuthStore();
  const [history, setHistory] = useState<PointHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRedeeming, setIsRedeeming] = useState(false);

  // Fungsi ini sekarang mengambil riwayat DAN data profil terbaru
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const token = Cookies.get('auth_token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    try {
      // Ambil riwayat dan profil secara bersamaan
      const [historyRes, profileRes] = await Promise.all([
        fetch(`${apiUrl}/api/points/history`, { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } }),
        fetch(`${apiUrl}/api/profile`, { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } })
      ]);
      
      if (!historyRes.ok) throw new Error("Gagal memuat riwayat poin.");
      if (!profileRes.ok) throw new Error("Gagal memuat profil pengguna.");

      const historyData = await historyRes.json();
      const profileData = await profileRes.json();
      
      setHistory(historyData.data);
      // PERBAIKAN UTAMA: Perbarui state global dengan data user terbaru dari server
      updateUserPoints(profileData.data.points);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [updateUserPoints]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRedeem = async () => {
    if (!window.confirm("Anda yakin ingin menukar 100 poin?")) return;

    setIsRedeeming(true);
    const toastId = toast.loading("Memproses...");
    const token = Cookies.get('auth_token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    try {
      const res = await fetch(`${apiUrl}/api/points/redeem`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // Perbarui state poin global dengan data dari API
      updateUserPoints(data.data.user.points);
      fetchData(); // Muat ulang riwayat
      
      toast.success(`Berhasil! Kode voucher Anda: ${data.data.coupon.code}`, { id: toastId, duration: 8000 });
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    } finally {
      setIsRedeeming(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center flex justify-center items-center gap-2"><Loader2 className="animate-spin"/> Memuat...</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Toaster />
      <h1 className="text-3xl font-bold mb-6">Pusat Poin</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-1 bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-8 rounded-lg shadow-lg flex flex-col justify-between">
          <div>
            <p className="text-lg">Total Poin Anda</p>
            <p className="text-5xl font-bold">{user?.points || 0}</p>
          </div>
          <p className="text-xs opacity-75 mt-4">Kumpulkan terus poin dari setiap pembelian!</p>
        </div>
        <div className="lg:col-span-2 bg-white p-8 rounded-lg shadow-md">
          <div className="flex items-center gap-4">
            <Gift className="w-16 h-16 text-indigo-500 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-bold">Tukar Poin Anda!</h2>
              <p className="text-muted-foreground">Tukarkan <strong>100 Poin</strong> dengan voucher diskon senilai <strong>Rp 10.000,-</strong></p>
              <Button className="mt-4" onClick={handleRedeem} disabled={isRedeeming || (user?.points || 0) < 100}>
                {isRedeeming ? <Loader2 className="animate-spin" /> : 'Tukarkan Sekarang'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Riwayat Poin</h2>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <ul className="space-y-4">
            {history.length > 0 ? history.map(item => (
              <li key={item.id} className="flex justify-between items-center border-b pb-2 last:border-b-0">
                <div>
                  <p className="font-semibold">{item.description}</p>
                  <p className="text-sm text-gray-500">{new Date(item.created_at).toLocaleString('id-ID')}</p>
                </div>
                <p className={`font-bold text-lg ${item.points_change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {item.points_change > 0 ? '+' : ''}{item.points_change}
                </p>
              </li>
            )) : <p>Belum ada riwayat poin.</p>}
          </ul>
        </div>
      </div>
    </div>
  );
}