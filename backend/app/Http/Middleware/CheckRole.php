<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        // Jika user tidak login atau tidak punya role yang diizinkan
        if (!Auth::check() || !in_array($request->user()->role, $roles)) {
            // Kembalikan error 403 Forbidden (Dilarang)
            return response()->json(['message' => 'This action is unauthorized.'], 403);
        }

        // Jika role cocok, izinkan request dilanjutkan
        return $next($request);
    }
}