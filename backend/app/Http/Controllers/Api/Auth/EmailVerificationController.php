<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\Request; // <-- Gunakan Request standar

class EmailVerificationController extends Controller
{
    /**
     * Menandai email pengguna sebagai terverifikasi.
     * PERBAIKAN: Kita tidak lagi menggunakan EmailVerificationRequest.
     */
    public function verify(Request $request, $id)
    {
        // 1. Temukan pengguna berdasarkan ID dari URL, jika tidak ada, gagal.
        $user = User::findOrFail($id);

        // 2. Cek jika hash dari URL valid. Ini adalah lapisan keamanan penting.
        if (!hash_equals((string) $request->route('hash'), sha1($user->getEmailForVerification()))) {
            return response()->json(['message' => 'Link verifikasi tidak valid.'], 403);
        }

        // 3. Cek jika email sudah pernah diverifikasi sebelumnya.
        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email sudah pernah diverifikasi.']);
        }

        // 4. Tandai email sebagai terverifikasi dan tembakkan event 'Verified'.
        if ($user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        // PERBAIKAN UTAMA: Ganti respons JSON dengan redirect ke frontend
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
        
        // Arahkan ke halaman sukses di frontend
        return redirect()->away($frontendUrl . '/auth/verify-success');
    }

    /**
     * Mengirim ulang email verifikasi.
     */
    public function resend(Request $request)
    {
        if ($request->user()->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email sudah terverifikasi.'], 400);
        }

        $request->user()->sendEmailVerificationNotification();

        return response()->json(['message' => 'Link verifikasi baru telah dikirim.']);
    }
}
