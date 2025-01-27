<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTravelBookingsTable extends Migration
{
    public function up()
    {
        Schema::create('travel_bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('client_id')->constrained('clients')->onDelete('cascade');
            $table->string('booking_type'); // 'flight' or 'hotel'
            $table->string('booking_reference');
            $table->string('provider_reference');
            $table->string('status');
            $table->decimal('total_price', 10, 2);
            $table->string('currency', 3);
            $table->json('booking_details');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('travel_bookings');
    }
}
