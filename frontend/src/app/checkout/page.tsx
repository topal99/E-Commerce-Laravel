'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Cookies from 'js-cookie';
import toast, { Toaster } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useCartStore } from '@/stores/cartStore';
import { Loader2, ArrowRight, Edit, MapPin } from 'lucide-react';
import { useRouter } from "next/navigation";
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/authStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AddressManager from '@/components/customer/AddressManager';

interface Address {
  id: number;
  label: string;
  recipient_name: string;
  phone_number: string;
  full_address: string;
  city: string;
}

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
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  // Fungsi untuk memuat ulang data alamat (akan diteruskan ke modal)
  const fetchAddresses = useCallback(async () => {
    const token = Cookies.get('auth_token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    try {
      const res = await fetch(`${apiUrl}/api/addresses`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      });
      const data = await res.json();
      setAddresses(data.data || []);
    } catch (error) {
      toast.error("Gagal memuat ulang alamat.");
    }
  }, []);

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      await Promise.all([fetchCart(), fetchAddresses()]);
      setIsLoading(false);
    };
    loadInitialData();
  }, [fetchCart, fetchAddresses]);

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

   if (!isLoading && items.length === 0) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Your cart is empty.</h1>
        <Link href="/" className="text-blue-500 hover:underline">
          Continue Shopping
        </Link>
      </div>
    );
  }

  const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);

  if (isLoading) return <div className="flex items-center justify-center mx-auto p-8" >
    <Loader2 className="animate-spin" />
    </div>;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Toaster />
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Kolom Kiri: Alamat & Pengiriman */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2"><MapPin/> Alamat Pengiriman</h2>
              <Button variant="outline" onClick={() => setIsAddressModalOpen(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Kelola Alamat
              </Button>
            </div>
            {selectedAddress ? (
              <div className="p-4 border rounded-lg bg-gray-50">
                <p className="font-bold">{selectedAddress.label}</p>
                <p>{selectedAddress.recipient_name}, {selectedAddress.phone_number}</p>
                <p className="text-sm text-gray-600">{selectedAddress.full_address}, {selectedAddress.city}</p>
              </div>
            ) : (
              <div className="text-center p-4 border-2 border-dashed rounded-lg">
                <p>Silakan pilih atau tambah alamat pengiriman.</p>
              </div>
            )}
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
                        <div className="space-y-4 mb-4">
              {(items || []).map(item => (
                <div key={item.id} className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                      <Image
                        src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${item.product.image_url}`} 
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="100px"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-sm leading-tight">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-right whitespace-nowrap">
                    Rp {new Intl.NumberFormat('id-ID').format(item.product.price * item.quantity)}
                  </div>
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
        {/* Modal Utama untuk Manajemen Alamat */}
      <Dialog open={isAddressModalOpen} onOpenChange={setIsAddressModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Kelola Alamat Pengiriman</DialogTitle></DialogHeader>
          <AddressManager
            addresses={addresses}
            selectedAddressId={selectedAddressId}
            onAddressSelect={(id) => {
              setSelectedAddressId(id);
              setIsAddressModalOpen(false); // Tutup modal setelah memilih
            }}
            onDataChange={fetchAddresses} // Berikan fungsi refresh
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
