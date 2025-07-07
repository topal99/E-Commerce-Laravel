<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
class OrderItem extends Model
{
    use HasFactory;
    public $timestamps = false;
    
    protected $fillable = [
        'order_id',
        'product_id',
        'quantity',
        'price',
        'status',
        'tracking_number',
    ];

    /**
     * Definisikan relasi bahwa satu OrderItem merujuk ke satu Product.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Definisikan relasi bahwa satu OrderItem dimiliki oleh satu Order.
     * INI ADALAH FUNGSI RELASI YANG HILANG DAN MENYEBABKAN ERROR.
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function returnRequest(): HasOne
    {
        return $this->hasOne(ReturnRequest::class);
    }

}