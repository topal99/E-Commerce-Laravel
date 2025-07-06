import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Cookies from 'js-cookie';

// Definisikan tipe User
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'store_owner' | 'customer';
}

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  // Fungsi baru untuk memperbarui profil pengguna
  updateUserProfile: (newProfileData: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      logout: () => {
        // Hapus juga cookie saat logout
        Cookies.remove('auth_token');
        Cookies.remove('auth_role');
        set({ token: null, user: null });
      },
      // Implementasi fungsi baru
      updateUserProfile: (newProfileData) =>
        set((state) => ({
          // Gabungkan data user yang lama dengan data profil yang baru
          user: state.user ? { ...state.user, ...newProfileData } : null,
        })),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);