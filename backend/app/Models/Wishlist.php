<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Wishlist extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     * Ini mengizinkan kolom 'user_id' dan 'product_id' diisi saat create().
     * Sangat penting untuk fungsi toggle di WishlistController.
     */
    protected $fillable = [
        'user_id',
        'product_id',
    ];

    /**
     * Definisikan relasi bahwa satu item Wishlist dimiliki oleh satu User.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Definisikan relasi bahwa satu item Wishlist merujuk ke satu Product.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
