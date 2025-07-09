'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/stores/cartStore';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2, ArrowRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';

// Komponen baru untuk baris item di keranjang
function CartItemRow({ item, onUpdate, onRemove, isUpdating }: { item: any; onUpdate: (id: number, qty: number) => void; onRemove: (id: number) => void; isUpdating: boolean; }) {
  // State lokal untuk input, agar tidak langsung memicu API
  const [quantity, setQuantity] = useState(item.quantity);

  // Debouncing effect
  useEffect(() => {
    // Jangan lakukan apa-apa jika kuantitasnya sama dengan yang ada di state global
    if (quantity === item.quantity) return;

    // Tunggu 500ms setelah user berhenti mengetik, baru panggil API
    const handler = setTimeout(() => {
      onUpdate(item.product_id, quantity);
    }, 500);

    // Bersihkan timeout jika user mengetik lagi
    return () => clearTimeout(handler);
  }, [quantity, item.quantity, item.product_id, onUpdate]);


  return (
    <div className="flex items-center justify-between border-t pt-4">
      <div className="flex items-center gap-4">
        <Image src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${item.product.image_url}`} alt={item.product.name} width={80} height={80} className="w-20 h-20 rounded object-cover"/>
        <div>
          <p className="font-semibold">{item.product.name}</p>
          <p className="text-gray-600 font-bold">Rp {new Intl.NumberFormat('id-ID').format(item.product.price)}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {/* Tampilkan loader jika item ini sedang diupdate */}
        {isUpdating ? <Loader2 className="w-5 h-5 animate-spin"/> : (
          <Input type="number" min="1" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value))} className="w-16 text-center"/>
        )}
        <Button variant="ghost" size="icon" onClick={() => onRemove(item.product_id)} disabled={isUpdating}>
          <Trash2 className="w-5 h-5 text-red-500"/>
        </Button>
      </div>
    </div>
  );
}


export default function CartPage() {
  const { items, fetchCart, updateQuantity, removeFromCart, isLoading: isCartLoading } = useCartStore();
  // State baru untuk melacak item mana yang sedang diupdate/dihapus
  const [updatingItemId, setUpdatingItemId] = useState<number | null>(null);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleUpdateQuantity = async (productId: number, qty: number) => {
    setUpdatingItemId(productId);
    await updateQuantity(productId, qty);
    setUpdatingItemId(null);
  };
  
  const handleRemoveItem = async (productId: number) => {
    setUpdatingItemId(productId);
    await removeFromCart(productId);
    setUpdatingItemId(null);
  };

  const groupedByStore = useMemo(() => {
    return (items || []).reduce((acc, item) => {
      const storeName = item.product.user?.name || 'Toko Tidak Dikenal';
      if (!acc[storeName]) {
        acc[storeName] = { storeInfo: item.product.user, items: [] };
      }
      acc[storeName].items.push(item);
      return acc;
    }, {} as Record<string, { storeInfo: any; items: typeof items }>);
  }, [items]);

  const subtotal = useMemo(() => {
    return (items || []).reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  }, [items]);

  if (isCartLoading) {
    return <div className="p-8 text-center flex items-center justify-center gap-2"><Loader2 className="animate-spin" /><span>Memuat keranjang...</span></div>;
  }

  if (!items || items.length === 0) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Keranjang Anda Kosong</h1>
        <Link href="/" className="text-blue-500 hover:underline">Mulai Belanja</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Keranjang Belanja</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {Object.entries(groupedByStore).map(([storeName, group]) => (
            <div key={storeName} className="bg-white p-6 rounded-lg shadow-md">
              <div className="mb-4">
                <Link href={`/toko/${group.storeInfo?.slug}`} className="font-semibold text-lg hover:underline">{storeName}</Link>
              </div>
              <div className="space-y-4">
                {group.items.map(item => (
                  <CartItemRow 
                    key={item.id} 
                    item={item} 
                    onUpdate={handleUpdateQuantity}
                    onRemove={handleRemoveItem}
                    isUpdating={updatingItemId === item.product_id}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md sticky top-24">
            <h2 className="text-xl font-semibold mb-4">Ringkasan Belanja</h2>
            <Separator />
            <div className="flex justify-between font-bold text-lg my-4">
              <p>Subtotal</p>
              <p>Rp {new Intl.NumberFormat('id-ID').format(subtotal)}</p>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Ongkos kirim dan diskon akan dihitung di halaman checkout.</p>
            <Button asChild size="lg" className="w-full">
              <Link href="/checkout">Lanjut ke Checkout <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
