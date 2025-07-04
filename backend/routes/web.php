<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage; // <-- Import Storage Facade

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    return ['Laravel' => app()->version()];
});


// ==========================================================
// RUTE BARU UNTUK MENYAJIKAN FILE DARI STORAGE
// ==========================================================
// Rute ini akan menangkap semua request yang dimulai dengan /storage/
Route::get('storage/{path}', function ($path) {
    // Pastikan path yang diminta aman dan tidak mencoba mengakses folder lain
    if (!Storage::disk('public')->exists($path)) {
        abort(404);
    }

    // Ambil file dari storage/app/public/{path}
    $file = Storage::disk('public')->get($path);
    // Dapatkan tipe file (misal: image/jpeg)
    $type = Storage::disk('public')->mimeType($path);

    // Kirim file sebagai respons dengan tipe yang benar
    return response($file)->header('Content-Type', $type);
})->where('path', '.*'); // ->where('path', '.*') memungkinkan path berisi subfolder
