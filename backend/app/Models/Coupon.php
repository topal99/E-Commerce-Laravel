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
        ];

        // Memberitahu Laravel untuk mengonversi 'expires_at' menjadi objek Carbon
        protected $casts = [
            'expires_at' => 'datetime',
        ];
    }
    