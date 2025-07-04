<?php

namespace App\Http\Controllers\Api;

    use App\Http\Controllers\Controller;
    use Illuminate\Http\Request;

    class ShippingController extends Controller
    {
        /**
         * Mensimulasikan kalkulasi ongkos kirim.
         */
        public function getOptions(Request $request)
        {
            // TODO: Ganti dengan integrasi API RajaOngkir di masa depan.
            // Untuk sekarang, kita kembalikan data palsu.
            $options = [
                [
                    'service' => 'JNE REG',
                    'description' => 'Layanan Reguler (2-3 hari)',
                    'cost' => 18000,
                ],
                [
                    'service' => 'SiCepat BEST',
                    'description' => 'Besok Sampai Tujuan',
                    'cost' => 25000,
                ],
                [
                    'service' => 'GoSend Instant',
                    'description' => 'Pengiriman Instan (1-2 jam)',
                    'cost' => 35000,
                ],
            ];

            return response()->json(['data' => $options]);
        }
    }
