<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo; // <-- Pastikan ini di-import

class Review extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'product_id', 'rating', 'comment'];

    /**
     * Definisikan relasi bahwa satu ulasan dimiliki oleh satu User.
     * INI PENTING AGAR NAMA USER BISA DITAMPILKAN.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
