<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     * Ini adalah "daftar izin" untuk metode create().
     */
    protected $fillable = [
        'user_id',
        'total_price',
        'status',
        'snap_token',
    ];

    /**
     * Definisikan relasi bahwa satu Order dimiliki oleh satu User.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Definisikan relasi bahwa satu Order memiliki banyak OrderItem.
     * INI SANGAT PENTING untuk method createMany().
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
