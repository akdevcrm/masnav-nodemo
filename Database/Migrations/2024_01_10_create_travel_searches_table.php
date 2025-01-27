<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTravelSearchesTable extends Migration
{
    public function up()
    {
        Schema::create('travel_searches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('client_id')->constrained('clients')->onDelete('cascade');
            $table->string('type'); // 'flight' or 'hotel'
            $table->string('from_location')->nullable();
            $table->string('to_location')->nullable();
            $table->date('departure_date');
            $table->date('return_date')->nullable();
            $table->integer('adults')->default(1);
            $table->integer('children')->default(0);
            $table->integer('rooms')->nullable();
            $table->boolean('with_pets')->default(false);
            $table->json('search_params')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('travel_searches');
    }
}
