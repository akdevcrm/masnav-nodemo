<?php

namespace Modules\Travel\Entities;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Client;

class TravelSearch extends Model
{
    protected $fillable = [
        'user_id',
        'client_id',
        'type',
        'from_location',
        'to_location',
        'departure_date',
        'return_date',
        'adults',
        'children',
        'rooms',
        'with_pets',
        'search_params'
    ];

    protected $casts = [
        'departure_date' => 'date',
        'return_date' => 'date',
        'with_pets' => 'boolean',
        'search_params' => 'array'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }
}
