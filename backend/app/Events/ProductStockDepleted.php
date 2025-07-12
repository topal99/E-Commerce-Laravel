<?php

namespace App\Events;

use App\Models\Product; // 1. Import model Product
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ProductStockDepleted
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Properti publik untuk menyimpan data produk yang di-restock.
     * Listener akan mengakses properti ini.
     * @var \App\Models\Product
     */
    public $product;

    /**
     * Buat instance event baru.
     * Fungsi ini akan menerima objek Product dari controller.
     *
     * @param \App\Models\Product $product
     * @return void
     */
    public function __construct(Product $product)
    {
        $this->product = $product;
    }
}
