'use client';

import { useCartStore } from "@/stores/cartStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Cookies from 'js-cookie';
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";

export default function CartPage() {
  // Mengambil state dan fungsi-fungsi baru dari store
  const { items, fetchCart, removeFromCart, updateQuantity } = useCartStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memuat data keranjang dari database saat halaman pertama kali dibuka
  useEffect(() => {
    const loadCart = async () => {
      setIsLoading(true);
      await fetchCart();
      setIsLoading(false);
    };
    loadCart();
  }, [fetchCart]);

  // Kalkulasi total harga dengan struktur data yang baru
  const totalPrice = items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  const handleCheckout = async () => {
    setError(null);
    setIsCheckingOut(true); // Mulai proses checkout

    const token = Cookies.get('auth_token');
    if (!token) {
      toast.error("Please login to proceed.");
      router.push('/login?redirect=/cart');
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
        body: JSON.stringify({ cart: items.map(item => ({ id: item.product_id, quantity: item.quantity })) })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Checkout failed!');

      toast.success('Order placed successfully!');
      
      // Muat ulang keranjang (yang sekarang kosong setelah checkout di backend)
      await fetchCart(); 
      router.push('/my-orders');

    } catch (err: any) {
      setError(err.message);
      toast.error(err.message || "An error occurred during checkout.");
    } finally {
      setIsCheckingOut(false); // Selesaikan proses checkout
    }
  };

  if (isLoading) {
    return <div className="container mx-auto p-8 text-center">Loading your cart...</div>;
  }
  
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

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-3xl">
      <Toaster position="top-center" />
      <h1 className="text-3xl font-bold mb-6">Your Shopping Cart</h1>
      {error && <p className="text-red-500 bg-red-100 p-3 rounded mb-4">{error}</p>}
      
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-md space-y-4">
        {items.map(item => (
          <div key={item.id} className="flex flex-col sm:flex-row items-center justify-between border-b pb-4">
            <div className="flex items-center space-x-4 w-full sm:w-auto">
              {/* Menampilkan Gambar Produk */}
              <div className="w-20 h-20 bg-gray-200 rounded flex-shrink-0">
                <img 
                  src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${item.product.image_url}`} 
                  alt={item.product.name}
                  className="w-full h-full object-cover rounded"
                />
              </div>
              <div>
                <h2 className="font-semibold text-lg text-black">{item.product.name}</h2>
                <p className="text-gray-600">Rp {new Intl.NumberFormat('id-ID').format(item.product.price)}</p>
                <button 
                  onClick={() => removeFromCart(item.product_id)} 
                  className="text-red-500 hover:underline text-sm mt-1"
                >
                  Remove
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-2 mt-4 sm:mt-0">
              <input 
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => updateQuantity(item.product_id, parseInt(e.target.value, 10))}
                className="w-16 text-center border rounded py-1"
              />
              <p className="font-semibold w-28 text-right text-black">
                Rp {new Intl.NumberFormat('id-ID').format(item.product.price * item.quantity)}
              </p>
            </div>
          </div>
        ))}

        <div className="text-right font-bold text-2xl mt-6 border-t pt-4 text-black">
          Total: Rp {new Intl.NumberFormat('id-ID').format(totalPrice)}
        </div>
        <button 
          onClick={handleCheckout} 
          disabled={isCheckingOut}
          className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg text-lg font-bold hover:bg-blue-700 transition-colors disabled:bg-blue-400"
        >
          {isCheckingOut ? 'Processing...' : 'Proceed to Checkout'}
        </button>
      </div>
    </div>
  );
}