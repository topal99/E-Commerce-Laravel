<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Contracts\Auth\MustVerifyEmail; 

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
         'name', 'email', 'password', 'role', 'google_id', 'slug', 'bio', 'points',  
        ];
    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    // ==========================================================
    // FUNGSI RELASI PENTING
    // ==========================================================

    /**
     * Relasi ke Order: Satu User bisa punya banyak Order.
     * (Ini untuk persiapan checkout nanti)
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Relasi ke Cart: Satu User bisa punya banyak item di keranjang.
     * INILAH FUNGSI YANG HILANG DAN MENYEBABKAN ERROR ANDA.
     */
    public function carts(): HasMany
    {
        return $this->hasMany(Cart::class);
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function wishlistItems(): HasMany
    {
        return $this->hasMany(Wishlist::class);
    }

    public function reviews(): HasMany { return $this->hasMany(Review::class); }

    public function addresses(): HasMany
    {
        return $this->hasMany(Address::class);
    }

    public function stockNotifications(): HasMany
    {
        return $this->hasMany(StockNotification::class);
    }

    public function questions(): HasMany { return $this->hasMany(Question::class); }

    public function pointHistories(): HasMany
    {
        return $this->hasMany(PointHistory::class)->latest();
    }
}