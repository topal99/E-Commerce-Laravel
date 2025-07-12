<?php

namespace App\Listeners;

 use App\Events\NewOrderReceived;
    use Illuminate\Contracts\Queue\ShouldQueue;
    use Illuminate\Queue\InteractsWithQueue;

    class NotifyStoreOwnerOfNewOrder implements ShouldQueue
    {
        use InteractsWithQueue;
        public function handle(NewOrderReceived $event): void
        {
            $order = $event->order;
            $notifiedOwners = [];

            // Loop melalui setiap item dalam pesanan
            foreach ($order->items as $item) {
                $owner = $item->product->user;

                // Jika owner belum dinotifikasi untuk pesanan ini, kirim notifikasi
                if (!in_array($owner->id, $notifiedOwners)) {
                    $owner->notifications()->create([
                        'message' => "Pesanan baru #{$order->id} telah diterima.",
                        'link' => '/owner/orders',
                    ]);
                    // Tandai owner ini agar tidak mendapat notifikasi ganda
                    $notifiedOwners[] = $owner->id;
                }
            }
        }
    }
    
