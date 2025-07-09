<?php

namespace App\Listeners;

use App\Events\OrderDelivered;
use App\Models\User; 
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\DB;

class AwardPointsForPurchase implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(OrderDelivered $event): void
    {
        $order = $event->order;
        // Ambil instance user yang "segar" langsung dari database
        $user = User::find($order->user_id);

        if (!$user) {
            return;
        }
        
        $subtotal = $order->items()->sum(DB::raw('price * quantity'));
        $pointsEarned = floor($subtotal / 10000);

        if ($pointsEarned > 0) {
            // Gunakan cara yang paling eksplisit untuk menjamin penyimpanan
            DB::table('users')->where('id', $user->id)->increment('points', $pointsEarned);
            
            $user->pointHistories()->create([
                'points_change' => $pointsEarned,
                'description' => "Poin dari Pesanan #{$order->id}",
                'related_type' => get_class($order),
                'related_id' => $order->id,
            ]);
        }
    }
}
