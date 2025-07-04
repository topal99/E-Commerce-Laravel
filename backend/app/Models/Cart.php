<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo; // <-- Pastikan ini di-import

class Cart extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id',
        'product_id',
        'quantity',
    ];

    /**
     * Definisikan relasi bahwa satu item Cart dimiliki oleh satu User.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Definisikan relasi bahwa satu item Cart merujuk ke satu Product.
     * INI ADALAH FUNGSI YANG HILANG DAN MEMPERBAIKI MASALAH ANDA.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
