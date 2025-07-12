import { create } from 'zustand';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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

interface Notification {
  id: number;
  message: string;
  link: string | null;
  read_at: string | null;
  created_at: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  fetchNotifications: async () => {
    try {
      const res = await fetchWithAuth(`${API_URL}/api/notifications`);
      if (!res.ok) throw new Error("Gagal mengambil notifikasi");
      const { data } = await res.json();
      set({ 
        notifications: data,
        unreadCount: data.filter((n: Notification) => !n.read_at).length
      });
    } catch (error) {
      console.error('Fetch Notifications Error:', error);
    }
  },
  markAllAsRead: async () => {
    const unreadNotifications = get().notifications.filter(n => !n.read_at);
    // Jika tidak ada yang perlu ditandai, jangan lakukan apa-apa
    if (unreadNotifications.length === 0) return;

    // Optimistic UI: Langsung update tampilan di frontend
    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, read_at: new Date().toISOString() })),
      unreadCount: 0
    }));
    try {
      // Kirim request ke backend di latar belakang
      await fetchWithAuth(`${API_URL}/api/notifications/mark-as-read`, { method: 'POST' });
    } catch (error) {
      // Jika gagal, muat ulang dari server untuk mengembalikan state yang benar
      console.error("Gagal menandai notifikasi sebagai dibaca:", error);
      get().fetchNotifications();
    }
  },
}));
