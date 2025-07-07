<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id',
        'name',
        'slug',
        'description',
        'image_url',
        'price',
        'stock',
        'category_id',
    ];

    /**
     * Relasi ke User (pemilik produk).
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    protected $casts = [
        'reviews_avg_rating' => 'float',
    ];


    /**
     * Relasi ke Category.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
    
    /**
     * Relasi ke OrderItem.
     */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
    
    /**
     * Relasi ke Wishlist.
     */
    public function wishlistedByUsers(): HasMany
    {
        return $this->hasMany(Wishlist::class);
    }
    
    /**
     * Relasi ke Review.
     * INI ADALAH FUNGSI YANG HILANG DAN MENYEBABKAN ERROR.
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function questions(): HasMany
    {
        return $this->hasMany(Question::class);
    }

}
