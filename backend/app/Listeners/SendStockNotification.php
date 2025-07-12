<?php

namespace App\Listeners;

use App\Events\ProductRestocked;
use App\Mail\ProductBackInStockMail;
use App\Models\StockNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendStockNotification implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Handle the event.
     */
    public function handle(ProductRestocked $event): void
    {
        Log::info("Listener SendStockNotification dijalankan untuk produk ID: {$event->product->id}");

        $product = $event->product;

        // 1. Cari semua pendaftaran notifikasi untuk produk ini yang belum dikirimi email
        $notifications = StockNotification::where('product_id', $product->id)
                                          ->where('notified', false)
                                          ->with('user')
                                          ->get();

        Log::info("Menemukan " . $notifications->count() . " pendaftar notifikasi.");

        // 2. Loop melalui setiap pendaftaran
        foreach ($notifications as $notification) {
            $user = $notification->user;
            if (!$user) continue; // Lewati jika user tidak ditemukan

            Log::info("Memproses notifikasi untuk User ID: {$user->id}");

            // Aksi 1: Kirim email ke pengguna
            Mail::to($user)->send(new ProductBackInStockMail($product));

            // PERBAIKAN UTAMA: Buat notifikasi di dalam aplikasi (untuk ikon lonceng)
            $user->notifications()->create([
                'message' => "Produk yang Anda tunggu, '{$product->name}', telah kembali tersedia!",
                'link' => "/products/{$product->slug}",
            ]);

            // Aksi 2: Tandai bahwa notifikasi email sudah dikirim
            $notification->update(['notified' => true]);
            
            Log::info("Notifikasi untuk User ID: {$user->id} berhasil diproses.");
        }
    }
}
