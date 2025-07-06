<?php

namespace App\Events;

use App\Models\Product; // Import model Product
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ProductRestocked
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Properti untuk menyimpan data produk.
     * @var \App\Models\Product
     */
    public $product;

    /**
     * Create a new event instance.
     *
     * @param \App\Models\Product $product
     * @return void
     */
    public function __construct(Product $product)
    {
        $this->product = $product;
    }
}
