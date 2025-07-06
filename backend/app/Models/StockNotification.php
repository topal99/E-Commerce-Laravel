<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockNotification extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     * Ini adalah daftar kolom yang diizinkan untuk diisi secara massal.
     */
    protected $fillable = [
        'user_id',
        'product_id',
        'notified',
    ];

    /**
     * Definisikan relasi bahwa satu notifikasi dimiliki oleh satu User.
     * Ini adalah "jembatan" yang memberitahu Laravel cara menemukan data pengguna
     * dari sebuah record notifikasi.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Definisikan relasi bahwa satu notifikasi merujuk ke satu Product.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
