<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'type',
        'value',
        'expires_at',
        'user_id',
        'order_id', // Tambahkan ini untuk kelengkapan
        'used_at',  // Tambahkan ini untuk kelengkapan
    ];

    /**
     * The attributes that should be cast.
     * Ini memberitahu Laravel untuk selalu memperlakukan kolom-kolom ini
     * sebagai objek Tanggal (Carbon), bukan teks biasa.
     */
    protected $casts = [
        'expires_at' => 'datetime',
        'used_at' => 'datetime', // <-- PERBAIKAN PENTING
    ];
}