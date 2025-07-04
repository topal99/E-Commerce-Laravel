'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Cookies from 'js-cookie';
import toast, { Toaster } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useCartStore } from '@/stores/cartStore';
import { Loader2, ArrowRight } from 'lucide-react';
import { type Address } from '@/app/my-account/addresses/page';
import { useRouter } from "next/navigation";
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface ShippingOption {
  service: string;
  description: string;
  cost: number;
}

interface Coupon {
  code: string;
  type: 'fixed' | 'percent';
  value: number;
}

export default function CheckoutPage() {
  const { items, fetchCart } = useCartStore();
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isShippingLoading, setIsShippingLoading] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      const token = Cookies.get('auth_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      try {
        await fetchCart();
        const res = await fetch(`${apiUrl}/api/addresses`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
        });
        const data = await res.json();
        // PERBAIKAN: Berikan array kosong sebagai fallback
        setAddresses(data.data || []);
      } catch (error) {
        toast.error("Gagal memuat data checkout.");
        setAddresses([]); // Pastikan tetap array jika error
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, [fetchCart]);

  useEffect(() => {
    if (!selectedAddressId) return;
    const getShipping = async () => {
      setIsShippingLoading(true);
      setSelectedShipping(null);
      const token = Cookies.get('auth_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      try {
        const res = await fetch(`${apiUrl}/api/shipping-options`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ address_id: selectedAddressId })
        });
        const data = await res.json();
        // PERBAIKAN: Berikan array kosong sebagai fallback
        setShippingOptions(data.data || []);
      } catch (error) {
        toast.error("Gagal memuat opsi pengiriman.");
        setShippingOptions([]); // Pastikan tetap array jika error
      } finally {
        setIsShippingLoading(false);
      }
    };
    getShipping();
  }, [selectedAddressId]);

  const { subtotal, discount, total } = useMemo(() => {
    const sub = (items || []).reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    let disc = 0;
    if (appliedCoupon) {
      if (appliedCoupon.type === 'percent') {
        disc = (sub * appliedCoupon.value) / 100;
      } else {
        disc = appliedCoupon.value;
      }
    }
    const total = sub - disc + (selectedShipping?.cost || 0);
    return { subtotal: sub, discount: disc, total: Math.max(0, total) };
  }, [items, selectedShipping, appliedCoupon]);

    const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    const token = Cookies.get('auth_token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    try {
        const res = await fetch(`${apiUrl}/api/coupons/apply`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ code: couponCode })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setAppliedCoupon(data.data);
        toast.success(data.message);
    } catch (error: any) {
        setAppliedCoupon(null);
        toast.error(error.message);
    } finally {
        setIsApplyingCoupon(false);
    }
  };

  const handleCheckout = async () => { 
    setIsCheckingOut(true);
    const token = Cookies.get('auth_token');
    if (!token || !selectedAddressId || !selectedShipping) {
      toast.error("Harap lengkapi alamat dan pilihan pengiriman.");
      setIsCheckingOut(false);
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    try {
      const res = await fetch(`${apiUrl}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        // PERBAIKAN UTAMA: Sertakan data kupon dan diskon di body request
        body: JSON.stringify({ 
            cart: items.map(item => ({ id: item.product_id, quantity: item.quantity })),
            shipping_address_id: selectedAddressId,
            shipping_cost: selectedShipping.cost,
            coupon_code: appliedCoupon?.code,
            discount_amount: discount,
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Checkout gagal!');

      toast.success('Pesanan berhasil dibuat!');
      await fetchCart(); 
      router.push('/my-orders');

    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan saat checkout.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Toaster />
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Kolom Kiri: Alamat & Pengiriman */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">1. Alamat Pengiriman</h2>
            <p>Pilih salah satu alamat</p>
            <br/>
            <div className="space-y-3">
              {(addresses || []).map(address => (
                <div key={address.id} onClick={() => setSelectedAddressId(address.id)}
                  className={`p-4 border rounded-lg cursor-pointer ${selectedAddressId === address.id ? 'bg-black text-white' : ''}`}>
                  <p className="font-bold">{address.label}</p>
                  <p>{address.recipient_name}, {address.phone_number}</p>
                  <p>{address.full_address}, {address.city}</p>
                </div>
              ))}
            </div>
            <Link href="/my-account/addresses">
            <Button className="mt-4 outline" variant="ghost-dark">Kelola Alamat</Button>
            </Link>
          </div>
          <div className={`bg-white p-6 rounded-lg shadow-md ${!selectedAddressId ? 'opacity-50' : ''}`}>
            <h2 className="text-xl font-semibold mb-4">2. Opsi Pengiriman</h2>
            {isShippingLoading && <Loader2 className="animate-spin" />}
            {!isShippingLoading && selectedAddressId && (
              <div className="space-y-3">
                {(shippingOptions || []).map(opt => (
                  <div key={opt.service} onClick={() => setSelectedShipping(opt)}
                    className={`p-4 border rounded-lg cursor-pointer ${selectedShipping?.service === opt.service ? 'bg-black text-white' : ''}`}>
                    <div className="flex justify-between">
                      <p className="font-bold">{opt.service}</p>
                      <p className="font-semibold">Rp {new Intl.NumberFormat('id-ID').format(opt.cost)}</p>
                    </div>
                    <p>{opt.description}</p>
                  </div>
                ))}
              </div>
            )}
            {!selectedAddressId && <p className="text-sm text-gray-500">Pilih alamat terlebih dahulu untuk melihat opsi pengiriman.</p>}
          </div>
        </div>
        {/* Kolom Kanan: Ringkasan Pesanan */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md sticky top-24">
            <h2 className="text-xl font-semibold mb-4 border-b pb-4">Ringkasan Pesanan</h2>
            <div className="space-y-2 mb-4">
              {(items || []).map(item => (
                <div key={item.id} className="flex text-sm">
                  {/* Menampilkan Gambar Produk */}
                <div className="w-20 h-20 bg-gray-200 rounded flex-shrink-0">
                      <Image
                        className="w-full h-full rounded-md object-cover" 
                        src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${item.product.image_url}`} 
                        alt={item.product.name} width={400} height={400}
                      />
                </div>
                  <span>{item.product.name} (x{item.quantity})</span>
                  <span>Rp {new Intl.NumberFormat('id-ID').format(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            
            <div className="my-4">
                <Label htmlFor="coupon">Kode Kupon</Label>
                <div className="flex gap-2 mt-1">
                    <Input id="coupon" placeholder="Masukkan kode" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} />
                    <Button onClick={handleApplyCoupon} disabled={isApplyingCoupon}>
                        {isApplyingCoupon ? <Loader2 className="animate-spin"/> : "Terapkan"}
                    </Button>
                </div>
            </div>

            <Separator />
            <div className="space-y-2 my-4">
              <div className="flex justify-between"><p>Subtotal</p><p>Rp {new Intl.NumberFormat('id-ID').format(subtotal)}</p></div>
              <div className="flex justify-between"><p>Diskon</p><p>Rp {new Intl.NumberFormat('id-ID').format(discount)}</p></div>
              <div className="flex justify-between"><p>Ongkos Kirim</p><p>Rp {new Intl.NumberFormat('id-ID').format(selectedShipping?.cost || 0)}</p></div>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg my-4">
              <p>Total</p><p>Rp {new Intl.NumberFormat('id-ID').format(total)}</p>
            </div>
            <Button className="w-full outline" variant="ghost-dark" size="lg" disabled={!selectedAddressId || !selectedShipping || isCheckingOut} onClick={handleCheckout}>
              {isCheckingOut ? <Loader2 className="animate-spin" /> : <>Lanjut ke Pembayaran <ArrowRight className="ml-2 h-4 w-4" /></>}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
