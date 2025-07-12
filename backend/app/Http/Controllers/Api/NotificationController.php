<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Mengambil daftar notifikasi terbaru untuk pengguna.
     */
    public function index(Request $request)
    {
        $notifications = $request->user()
                                     ->notifications() // Menggunakan relasi kustom kita
                                     ->latest()
                                     ->limit(10)
                                     ->get();
        return response()->json(['data' => $notifications]);
    }

    /**
     * Menandai semua notifikasi yang belum dibaca sebagai sudah dibaca.
     */
    public function markAsRead(Request $request)
    {
        // PERBAIKAN UTAMA: Gunakan relasi 'notifications()' yang sudah kita definisikan,
        // bukan 'unreadNotifications()'
        $request->user()
                ->notifications()       // 1. Ambil semua notifikasi milik user
                ->whereNull('read_at')  // 2. Cari yang kolom 'read_at'-nya masih kosong (null)
                ->update(['read_at' => now()]); // 3. Update kolom tersebut dengan waktu saat ini

        return response()->json(['message' => 'Semua notifikasi ditandai sebagai sudah dibaca.']);
    }
}
