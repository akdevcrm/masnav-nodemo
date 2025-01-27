<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTravelSettingsTable extends Migration
{
    public function up()
    {
        Schema::create('travel_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('commission_type')->default('percentage'); // 'percentage' or 'fixed'
            $table->decimal('commission_value', 10, 2)->default(10.00); // Default 10%
            $table->decimal('service_fee', 10, 2)->default(50.00); // Default $50
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('travel_settings');
    }
}
