'use client';

import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import toast from 'react-hot-toast';
import Cookies from "js-cookie";
// Import tipe 'Order' dari halaman induknya
import { type Order } from "@/app/owner/orders/page"; 

// Definisikan tipe spesifik untuk status agar bisa digunakan kembali
type OrderStatus = 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface UpdateOrderFormProps {
  order: Order;
  onSaved: () => void;
}

export default function UpdateOrderForm({ order, onSaved }: UpdateOrderFormProps) {
  // Gunakan tipe OrderStatus yang sudah kita definisikan untuk state
  const [status, setStatus] = useState<OrderStatus>(order.items[0]?.status || 'processing');
  const [trackingNumber, setTrackingNumber] = useState(order.items[0]?.tracking_number || '');
  const [isSaving, setIsSaving] = useState(false);
  const [courierName, setCourierName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const token = Cookies.get('auth_token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      
    try {
      const res = await fetch(`${apiUrl}/api/owner/orders/${order.id}/update-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status, courier_name: courierName, tracking_number: trackingNumber }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal memperbarui status.");

      toast.success("Status pesanan berhasil diperbarui!");
      onSaved(); // Panggil fungsi callback untuk menutup modal & refresh data
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="p-4 bg-gray-50 rounded-md">
          <p className="text-sm font-medium">Anda akan memperbarui status untuk {order.items.length} produk dalam pesanan ini:</p>
          <ul className="text-xs list-disc list-inside text-gray-600">
            {order.items.map(item => <li key={item.id}>{item.product.name}</li>)}
          </ul>
      </div>
      
      <div>
        <Label htmlFor="status">Status Pesanan</Label>
        <select id="status" value={status} onChange={(e) => setStatus(e.target.value as any)} className="w-full ...">
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Input baru untuk kurir dan resi */}
      <div>
        <Label htmlFor="courier_name">Kurir Pengiriman (Kode)</Label>
        <Input id="courier_name" placeholder="cth: jne, sicepat, jnt" value={courierName} onChange={(e) => setCourierName(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="tracking_number">Nomor Resi</Label>
        <Input id="tracking_number" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} />
      </div>

      <Button type="submit" disabled={isSaving} className="w-full">
        {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
      </Button>
    </form>
  );
}
