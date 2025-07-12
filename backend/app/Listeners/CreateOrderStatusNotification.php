<?php

namespace App\Listeners;

    use App\Events\OrderStatusUpdated;
    use Illuminate\Contracts\Queue\ShouldQueue;
    use Illuminate\Queue\InteractsWithQueue;

    class CreateOrderStatusNotification implements ShouldQueue
    {
        use InteractsWithQueue;
        public function handle(OrderStatusUpdated $event): void
        {
            $order = $event->order;
            $customer = $event->customer;
            $status = $order->items()->first()->status; // Ambil status terbaru

            $customer->notifications()->create([
                'message' => "Status pesanan Anda #{$order->id} telah diperbarui menjadi '{$status}'.",
                'link' => "/my-orders/{$order->id}",
            ]);
        }
    }
    
