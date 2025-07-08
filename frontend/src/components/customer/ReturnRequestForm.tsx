'use client';

import { useState } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import toast from 'react-hot-toast';
import Cookies from "js-cookie";

interface OrderItem { id: number; product: { name: string }; }
interface ReturnRequestFormProps {
  orderItem: OrderItem;
  onSubmitted: () => void;
}

export default function ReturnRequestForm({ orderItem, onSubmitted }: ReturnRequestFormProps) {
  const [reason, setReason] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error("Alasan pengembalian tidak boleh kosong.");
      return;
    }
    setIsSubmitting(true);
    const token = Cookies.get('auth_token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    const formData = new FormData();
    formData.append('reason', reason);
    if (image) {
      formData.append('image', image);
    }

    try {
      const res = await fetch(`${apiUrl}/api/order-items/${orderItem.id}/returns`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      toast.success("Permintaan pengembalian berhasil dikirim.");
      onSubmitted();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <p className="text-sm font-semibold">Produk: {orderItem.product.name}</p>
      <div>
        <Label htmlFor="reason">Alasan Pengembalian</Label>
        <Textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="image">Foto Bukti (Opsional)</Label>
        <Input id="image" type="file" onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)} />
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Mengirim..." : "Kirim Permintaan"}
      </Button>
    </form>
  );
}
