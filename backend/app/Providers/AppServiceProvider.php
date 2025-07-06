<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\URL;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        //
    ];

    public function boot(): void
    {
        // Membuat URL verifikasi kustom
        VerifyEmail::createUrlUsing(function ($notifiable) {
            // Buat URL yang ditandatangani (signed) oleh Laravel ke API kita
            $backendUrl = URL::temporarySignedRoute(
                'verification.verify', // Nama rute API yang kita buat
                now()->addMinutes(60),
                [
                    'id' => $notifiable->getKey(),
                    'hash' => sha1($notifiable->getEmailForVerification()),
                ]
            );

            // Ganti domain API backend dengan domain frontend
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
            // URL akhir yang akan ada di email, menunjuk ke halaman verifikasi di frontend
            return str_replace(url('/api'), $frontendUrl . '/auth', $backendUrl);
        });
    }
}
