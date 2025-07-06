<?php

namespace App\Listeners;

use App\Events\ProductRestocked;
use App\Mail\ProductBackInStockMail; // Kita akan buat Mailable ini
use App\Models\StockNotification;
use Illuminate\Contracts\Queue\ShouldQueue; // Implementasi untuk antrian
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Mail;

// Implementasi ShouldQueue akan membuat listener ini berjalan di latar belakang
class SendStockNotification implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Handle the event.
     */
    public function handle(ProductRestocked $event): void
    {
        $product = $event->product;

        // 1. Cari semua pendaftaran notifikasi untuk produk ini yang belum dikirimi email
        $notifications = StockNotification::where('product_id', $product->id)
                                          ->where('notified', false)
                                          ->with('user') // Ambil juga data user-nya
                                          ->get();

        // 2. Loop melalui setiap pendaftaran
        foreach ($notifications as $notification) {
            // Kirim email ke pengguna
            Mail::to($notification->user)->send(new ProductBackInStockMail($product));

            // 3. Tandai bahwa notifikasi sudah dikirim agar tidak dikirim dua kali
            $notification->update(['notified' => true]);
        }
    }
}
