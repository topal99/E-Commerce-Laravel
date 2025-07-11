import { create } from 'zustand';
import Cookies from 'js-cookie';

// Definisikan tipe data untuk kejelasan dan keamanan tipe
interface Product { 
  id: number; 
  name: string; 
  price: number; 
  image_url: string; 
  user?: {
    id: number;
    name: string;
    slug: string;
  };
}
interface CartItem { 
  id: number; 
  product_id: number; 
  user_id: number; 
  quantity: number; 
  product: Product; 
}

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addToCart: (productId: number, quantity?: number) => Promise<void>; 
  removeFromCart: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  clearCartOnLogout: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Fungsi helper terpusat untuk semua request yang butuh otentikasi
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = Cookies.get('auth_token');
  if (!token) {
    // Jika tidak ada token, langsung hentikan proses
    throw new Error('Pengguna tidak terotentikasi. Silakan login terlebih dahulu.');
  }

  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json', // Header ini penting untuk mencegah redirect dari Laravel
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isLoading: true,
  
  fetchCart: async () => {
    set({ isLoading: true }); // Mulai loading
    try {
      const res = await fetchWithAuth(`${API_URL}/api/cart`);
      if (!res.ok) throw new Error('Gagal mengambil data keranjang.');
      const { data } = await res.json();
      set({ items: data || [] });
    } catch (error) {
      console.error('Fetch Cart Error:', error);
      set({ items: [] });
    } finally {
      set({ isLoading: false }); // Selesaikan loading
    }
  },

  /**
   * Menambahkan produk ke keranjang di server, lalu menyinkronkan state.
   */
  addToCart: async (productId: number, quantity: number = 1) => {
    try {
      // 1. Kirim request ke backend untuk menambah item
      const res = await fetchWithAuth(`${API_URL}/api/cart`, {
        method: 'POST',
        body: JSON.stringify({ 
          product_id: productId,
          quantity: quantity
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Gagal menambahkan produk.');
      }

      // 2. SANGAT PENTING: Panggil fetchCart() untuk mengambil state terbaru dari server
      await get().fetchCart(); 
    } catch (error) {
      console.error('Add to Cart Error:', error);
      // Lempar error lagi agar bisa ditangkap oleh komponen (misal: untuk toast notifikasi)
      throw error;
    }
  },

  /**
   * Menghapus produk dari keranjang di server.
   */
  removeFromCart: async (productId: number) => {
    try {
      await fetchWithAuth(`${API_URL}/api/cart/${productId}`, { method: 'DELETE' });
      await get().fetchCart(); // Sinkronisasi ulang
    } catch (error) { 
      console.error('Remove From Cart Error:', error);
      throw error; 
    }
  },
  
  /**
   * Mengubah kuantitas produk di keranjang di server.
   */
  updateQuantity: async (productId: number, quantity: number) => {
    // Jika kuantitas 0 atau kurang, anggap sebagai aksi hapus
    if (quantity < 1) {
      return get().removeFromCart(productId);
    }
    try {
      await fetchWithAuth(`${API_URL}/api/cart/${productId}`, { 
        method: 'PATCH', 
        body: JSON.stringify({ quantity }) 
      });
      await get().fetchCart(); // Sinkronisasi ulang
    } catch (error) { 
      console.error('Update Quantity Error:', error);
      throw error; 
    }
  },

  /**
   * Membersihkan state keranjang di frontend saja (dipanggil saat logout).
   */
  clearCartOnLogout: () => set({ items: [] }),
}));
