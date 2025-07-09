<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PointHistory extends Model
{
    protected $fillable = ['user_id', 'points_change', 'description', 'related_type', 'related_id'];
}
