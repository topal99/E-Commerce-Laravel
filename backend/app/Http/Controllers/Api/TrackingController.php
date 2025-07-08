<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class TrackingController extends Controller
{
    public function track(Request $request, OrderItem $orderItem)
    {
        // Otorisasi: Pastikan pengguna hanya bisa melacak pesanannya sendiri
        if ($request->user()->id !== $orderItem->order->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Validasi: Pastikan item memiliki nomor resi dan kurir
        if (!$orderItem->tracking_number || !$orderItem->courier_name) {
            return response()->json(['message' => 'Informasi pelacakan tidak lengkap untuk item ini.'], 404);
        }

        try {
            // Panggil API Biteship untuk melacak resi
            $response = Http::withHeaders([
                'Authorization' => env('BITESHIP_API_KEY')
            ])->get("https://api.biteship.com/v1/trackings/{$orderItem->tracking_number}/couriers/{$orderItem->courier_name}");

            if (!$response->successful() || !$response->json()['success']) {
                throw new \Exception($response->json()['error'] ?? 'Gagal mengambil data pelacakan.');
            }

            // Langsung teruskan seluruh respons JSON dari Biteship ke frontend
            return response()->json($response->json());

        } catch (\Exception $e) {
            return response()->json(['message' => 'Terjadi kesalahan saat melacak pesanan.', 'error' => $e->getMessage()], 500);
        }
    }
}
