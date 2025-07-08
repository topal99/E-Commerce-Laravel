<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RegionController extends Controller
{
    protected $apiKey;
    // Base URL untuk API Maps Biteship
    protected $baseUrl = 'https://api.biteship.com/v1/maps/areas';

    public function __construct()
    {
        $this->apiKey = env('BITESHIP_API_KEY');
    }

    private function callBiteshipApi(array $params)
    {
        if (!$this->apiKey) {
            Log::error('BITESHIP_API_KEY tidak ditemukan di .env');
            return response()->json(['message' => 'Konfigurasi layanan wilayah tidak lengkap.'], 500);
        }

        try {
            $response = Http::withHeaders(['Authorization' => $this->apiKey])
                            ->get($this->baseUrl, $params);

            if (!$response->successful() || !$response->json()['success']) {
                Log::error('Biteship API Error: ' . $response->body());
                return response()->json(['message' => 'Gagal mengambil data wilayah.'], 502);
            }
            
            return response()->json($response->json()['areas']);

        } catch (\Exception $e) {
            Log::error('Exception saat menghubungi Biteship: ' . $e->getMessage());
            return response()->json(['message' => 'Terjadi kesalahan internal.'], 500);
        }
    }

    public function getProvinces()
    {
        return $this->callBiteshipApi([
            'countries' => 'ID',
            'type' => 'province'
        ]);
    }

    public function getCities(Request $request)
    {
        $provinceName = $request->query('province_name');
        return $this->callBiteshipApi([
            'countries' => 'ID',
            'type' => 'city',
            'province_name' => $provinceName
        ]);
    }

    public function getDistricts(Request $request)
    {
        $cityName = $request->query('city_name');
        return $this->callBiteshipApi([
            'countries' => 'ID',
            'type' => 'subdistrict',
            'city_name' => $cityName
        ]);
    }
}
