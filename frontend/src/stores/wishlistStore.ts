import { create } from 'zustand';
import Cookies from 'js-cookie';

interface WishlistState {
  // Menggunakan Set lebih efisien untuk mengecek keberadaan ID
  wishlistedProductIds: Set<number>;
  fetchWishlist: () => Promise<void>;
  toggleWishlist: (productId: number) => Promise<void>;
  clearWishlistOnLogout: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Fungsi helper untuk fetch dengan otentikasi
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = Cookies.get('auth_token');
  if (!token) throw new Error('Pengguna tidak terotentikasi');

  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });
};

export const useWishlistStore = create<WishlistState>((set, get) => ({
  wishlistedProductIds: new Set(),

  fetchWishlist: async () => {
    try {
      const res = await fetchWithAuth(`${API_URL}/api/wishlist`);
      if (!res.ok) throw new Error('Gagal mengambil data wishlist');
      const { data } = await res.json();
      // 'data' dari API adalah array berisi ID produk, kita ubah menjadi Set
      set({ wishlistedProductIds: new Set(data) });
    } catch (error) {
      console.error('Fetch Wishlist Error:', error);
      set({ wishlistedProductIds: new Set() }); // Kosongkan jika error
    }
  },

  toggleWishlist: async (productId: number) => {
    // Optimistic UI: Update UI dulu, baru kirim request API
    const currentWishlist = get().wishlistedProductIds;
    const newWishlist = new Set(currentWishlist);
    if (newWishlist.has(productId)) {
      newWishlist.delete(productId);
    } else {
      newWishlist.add(productId);
    }
    set({ wishlistedProductIds: newWishlist });

    // Kirim request API di background
    try {
      const res = await fetchWithAuth(`${API_URL}/api/wishlist/toggle`, {
        method: 'POST',
        body: JSON.stringify({ product_id: productId }),
      });
      if (!res.ok) throw new Error('Gagal memperbarui wishlist');
      
      // Sinkronisasi ulang data setelah berhasil untuk memastikan konsistensi
      await get().fetchWishlist();
    } catch (error) {
      console.error('Toggle Wishlist Error:', error);
      // Jika gagal, kembalikan state ke semula (revert)
      set({ wishlistedProductIds: currentWishlist });
      throw error; // Lempar error agar bisa ditangkap di komponen
    }
  },

  clearWishlistOnLogout: () => set({ wishlistedProductIds: new Set() }),
}));
