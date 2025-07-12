<?php

namespace App\Listeners;

use App\Events\ProductStockDepleted;
    use Illuminate\Contracts\Queue\ShouldQueue;
    class NotifyOwnerOfEmptyStock implements ShouldQueue
    {
        public function handle(ProductStockDepleted $event): void
        {
            $product = $event->product;
            $owner = $product->user;

            $owner->notifications()->create([
                'message' => "Perhatian! Stok untuk produk '{$product->name}' telah habis.",
                'link' => "/owner/my-products",
            ]);
        }
    }