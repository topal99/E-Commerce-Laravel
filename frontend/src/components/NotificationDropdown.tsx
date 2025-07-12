'use client';
import { useNotificationStore } from '@/stores/notificationStore';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from './ui/dropdown-menu';
import { Button } from './ui/button';
import { Bell, CheckCheck } from 'lucide-react';
import Link from 'next/link';

export default function NotificationDropdown() {
  const { notifications, unreadCount, fetchNotifications, markAllAsRead } = useNotificationStore();

  // Fungsi baru yang akan dipanggil saat dropdown dibuka
  const handleOpenChange = async (open: boolean) => {
    // Hanya jalankan jika dropdown AKAN DIBUKA
    if (open) {
      // 1. Ambil data notifikasi terbaru dari server
      await fetchNotifications();
      
      // 2. Setelah data terbaru didapat, baru tandai sebagai sudah dibaca
      if (unreadCount > 0) {
        markAllAsRead();
      }
    }
  };

  return (
    // PERBAIKAN: Gunakan onOpenChange untuk memicu pengambilan data
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 transform translate-x-1 -translate-y-1 bg-red-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">{unreadCount}</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex justify-between items-center p-2">
          <DropdownMenuLabel className="p-0">Notifikasi</DropdownMenuLabel>
          {notifications.length > 0 && (
            <Button variant="link" size="sm" className="p-0 h-auto text-xs" onClick={markAllAsRead}>
              <CheckCheck className="w-3 h-3 mr-1" /> Tandai semua dibaca
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-80 overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map(notif => (
              <Link href={notif.link || '#'} key={notif.id}>
                <DropdownMenuItem className={`flex flex-col items-start whitespace-normal cursor-pointer ${!notif.read_at ? 'bg-blue-50' : ''}`}>
                  <p className="text-sm">{notif.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(notif.created_at).toLocaleString('id-ID')}</p>
                </DropdownMenuItem>
              </Link>
            ))
          ) : (
            <p className="p-4 text-sm text-center text-muted-foreground">Tidak ada notifikasi.</p>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
