<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Answer extends Model
{
    protected $fillable = [
        'question_id', 'user_id', 'answer_text'
];

    public function user() {
         return $this->belongsTo(User::class); 
        }
}
