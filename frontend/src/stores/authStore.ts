// src/stores/authStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Cookies from 'js-cookie'; // <-- IMPORT Cookies

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'store_owner' | 'customer'; // <-- Tambahkan ini

}

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      logout: () => {
        // Hapus juga dari localStorage
        Cookies.remove('auth_token'); // <-- HAPUS COOKIE SAAT LOGOUT
        localStorage.removeItem('auth-storage'); 
        set({ token: null, user: null });
      },
    }),
    {
      name: 'auth-storage', // Key di localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
);