<?php

namespace App\Listeners;

 use App\Events\ReturnRequested;
    use Illuminate\Contracts\Queue\ShouldQueue;
    class NotifyOwnerOfReturnRequest implements ShouldQueue
    {
        public function handle(ReturnRequested $event): void
        {
            $returnRequest = $event->returnRequest;
            $owner = $returnRequest->orderItem->product->user;
            $customer = $returnRequest->user;

            $owner->notifications()->create([
                'message' => "{$customer->name} mengajukan pengembalian untuk '{$returnRequest->orderItem->product->name}'.",
                'link' => "/owner/returns",
            ]);
        }
    }
    
