<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Question extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = ['user_id', 'product_id', 'question_text'];

    /**
     * Relasi: Satu pertanyaan dimiliki oleh satu User (penanya).
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relasi: Satu pertanyaan memiliki satu Jawaban (Answer).
     */
    public function answer(): HasOne
    {
        return $this->hasOne(Answer::class);
    }

    /**
     * Relasi: Satu pertanyaan merujuk ke satu Produk.
     * INI ADALAH FUNGSI YANG HILANG DAN MEMPERBAIKI MASALAH ANDA.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
