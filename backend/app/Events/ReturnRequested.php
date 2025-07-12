<?php

namespace App\Events;

use App\Models\ReturnRequest; // 1. Import model ReturnRequest
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ReturnRequested
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Properti publik untuk menyimpan data permintaan pengembalian.
     * Listener akan mengakses properti ini.
     * @var \App\Models\ReturnRequest
     */
    public $returnRequest;

    /**
     * Buat instance event baru.
     * Fungsi ini akan menerima objek ReturnRequest dari controller.
     *
     * @param \App\Models\ReturnRequest $returnRequest
     * @return void
     */
    public function __construct(ReturnRequest $returnRequest)
    {
        $this->returnRequest = $returnRequest;
    }
}
