<?php

namespace App\Models;

    use Illuminate\Database\Eloquent\Factories\HasFactory;
    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\Relations\BelongsTo;

    class ReturnRequest extends Model
    {
        use HasFactory;

        protected $fillable = [
            'order_item_id',
            'user_id',
            'reason',
            'image_url',
            'status',
        ];

        public function orderItem(): BelongsTo
        {
            return $this->belongsTo(OrderItem::class);
        }

        public function user(): BelongsTo
        {
            return $this->belongsTo(User::class);
        }
    }
    