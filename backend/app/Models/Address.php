<?php

namespace App\Models;

    use Illuminate\Database\Eloquent\Factories\HasFactory;
    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\Relations\BelongsTo;

    class Address extends Model
    {
        use HasFactory;

        protected $fillable = [
            'user_id',
            'label',
            'recipient_name',
            'phone_number',
            'full_address',
            'city',
            'province',
            'postal_code',
            'is_primary',
        ];

        public function user(): BelongsTo
        {
            return $this->belongsTo(User::class);
        }
    }