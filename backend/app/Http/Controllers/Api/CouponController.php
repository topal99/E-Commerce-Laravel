<?php

namespace App\Http\Controllers\Api;

    use App\Http\Controllers\Controller;
    use App\Models\Coupon;
    use Illuminate\Http\Request;

    class CouponController extends Controller
    {
        public function apply(Request $request)
        {
            $validated = $request->validate(['code' => 'required|string']);

            $coupon = Coupon::where('code', $validated['code'])->first();

            // Cek jika kupon tidak ada atau sudah kedaluwarsa
            if (!$coupon || ($coupon->expires_at && $coupon->expires_at->isPast())) {
                return response()->json(['message' => 'Kode kupon tidak valid atau sudah kedaluwarsa.'], 404);
            }

            // Jika valid, kirim kembali detail kupon
            return response()->json([
                'success' => true,
                'message' => 'Kupon berhasil diterapkan!',
                'data' => $coupon,
            ]);
        }
    }
    