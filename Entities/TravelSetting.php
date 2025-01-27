<?php

namespace Modules\Travel\Entities;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class TravelSetting extends Model
{
    protected $fillable = [
        'user_id',
        'commission_type',
        'commission_value',
        'service_fee'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function calculateFinalPrice($basePrice)
    {
        $serviceFee = $this->service_fee;
        $commission = $this->commission_type === 'percentage'
            ? $basePrice * ($this->commission_value / 100)
            : $this->commission_value;

        return $basePrice + $serviceFee + $commission;
    }
}
