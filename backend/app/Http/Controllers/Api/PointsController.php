<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PointsController extends Controller
{
    public function history(Request $request)
    {
        $history = $request->user()->pointHistories()->paginate(15);
        return response()->json($history);
    }

    public function redeem(Request $request)
    {
        $user = $request->user();
        $pointsToRedeem = 100;
        $voucherValue = 10000;

        if ($user->points < $pointsToRedeem) {
            return response()->json(['message' => 'Poin Anda tidak mencukupi.'], 422);
        }

        // Kurangi poin pengguna
        $user->decrement('points', $pointsToRedeem);

        // Buat voucher unik baru
        $coupon = Coupon::create([
            'code' => 'V-' . Str::upper(Str::random(8)),
            'type' => 'fixed',
            'value' => $voucherValue,
            'expires_at' => now()->addMonth(),
            'user_id' => $user->id, // <-- Tautkan voucher ke pengguna
        ]);

        // Catat di riwayat
        $user->pointHistories()->create([
            'points_change' => -$pointsToRedeem,
            'description' => "Tukar poin dengan Voucher #{$coupon->code}",
            'related_type' => get_class($coupon),
            'related_id' => $coupon->id,
        ]);

        // PERBAIKAN: Kirim kembali data user yang sudah diupdate dan kode voucher baru
        return response()->json([
            'success' => true,
            'message' => "Selamat! Anda berhasil menukar {$pointsToRedeem} poin.",
            'data' => [
                'user' => $user->fresh(),
                'coupon' => $coupon,
            ]
        ]);
    }
}
