<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Address;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AddressController extends Controller
{
    /**
     * Mengambil semua alamat milik pengguna yang sedang login.
     */
    public function index(Request $request)
    {
        return response()->json(['data' => $request->user()->addresses()->latest()->get()]);
    }

    /**
     * Menyimpan alamat baru ke database.
     */
    public function store(Request $request)
    {
        // PERBAIKAN UTAMA: Menambahkan aturan validasi yang lengkap.
        $validated = $request->validate([
            'label' => 'required|string|max:255',
            'recipient_name' => 'required|string|max:255',
            'phone_number' => 'required|string|max:20',
            'full_address' => 'required|string',
            'province' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'postal_code' => 'required|string|max:10',
        ]);

        // Tambahkan user_id ke data yang akan disimpan
        $validated['user_id'] = $request->user()->id;

        // Buat alamat baru menggunakan data yang sudah divalidasi
        $address = Address::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Alamat berhasil disimpan.',
            'data' => $address
        ], 201);
    }

    /**
     * Menghapus alamat yang sudah ada.
     */
    public function destroy(Request $request, Address $address)
    {
        // Otorisasi: Pastikan pengguna hanya bisa menghapus alamatnya sendiri.
        if ($request->user()->id !== $address->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $address->delete();
        
        return response()->json(['message' => 'Alamat berhasil dihapus.']);
    }
}
