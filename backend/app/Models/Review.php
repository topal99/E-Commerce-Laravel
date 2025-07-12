<?php

namespace App\Models;

// 1. Tambahkan use statement untuk Product dan User
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'user_id',
        'rating',
        'comment',
    ];

    // 2. Tambahkan method relasi ke Product
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    // 3. Tambahkan method relasi ke User
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}