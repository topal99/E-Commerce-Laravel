import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Cookies from 'js-cookie';

// Definisikan tipe User dengan properti points
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'store_owner' | 'customer';
  points?: number; 
}

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  updateUserProfile: (newProfileData: Partial<User>) => void;
  // Fungsi baru untuk memperbarui poin pengguna
  updateUserPoints: (newPoints: number) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      logout: () => {
        Cookies.remove('auth_token');
        Cookies.remove('auth_role');
        set({ token: null, user: null });
      },
      updateUserProfile: (newProfileData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...newProfileData } : null,
        })),
      
      // Implementasi fungsi baru untuk poin
      updateUserPoints: (newPoints) =>
        set((state) => ({
            // Perbarui hanya properti 'points' dari user yang ada
            user: state.user ? { ...state.user, points: newPoints } : null,
        })),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);