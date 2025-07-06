<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class SocialLoginController extends Controller
{
    /**
     * Mengarahkan pengguna ke halaman otentikasi Google.
     */
    public function redirectToGoogle()
    {
        // Kode ini sekarang akan berfungsi karena Laravel tahu persis class mana yang dimaksud
        return Socialite::driver('google')->stateless()->redirect();
    }

    /**
     * Menangani callback dari Google setelah otentikasi.
     */
    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();

            $user = User::updateOrCreate(
                [
                    'email' => $googleUser->getEmail(),
                ],
                [
                    'name' => $googleUser->getName(),
                    'google_id' => $googleUser->getId(),
                    'password' => Hash::make(Str::random(24)),
                    'role' => 'customer',
                ]
            );

            $token = $user->createToken('auth-token')->plainTextToken;
            
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
            
            return redirect()->away($frontendUrl . '/auth/callback?token=' . $token . '&role=' . $user->role . '&name=' . urlencode($user->name) . '&email=' . urlencode($user->email));

        } catch (\Exception $e) {
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
            return redirect()->away($frontendUrl . '/login?error=google_auth_failed');
        }
    }
}