<?php

namespace Modules\Travel\Entities;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Client;

class TravelFavorite extends Model
{
    protected $fillable = [
        'user_id',
        'client_id',
        'type',
        'provider_id',
        'details'
    ];

    protected $casts = [
        'details' => 'array'
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
