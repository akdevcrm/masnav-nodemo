<?php

namespace Modules\Travel\Entities;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Client;

class TravelBooking extends Model
{
    protected $fillable = [
        'user_id',
        'client_id',
        'booking_type',
        'booking_reference',
        'provider_reference',
        'status',
        'total_price',
        'currency',
        'booking_details'
    ];

    protected $casts = [
        'booking_details' => 'array'
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
