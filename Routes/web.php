<?php

use Illuminate\Support\Facades\Route;
use Modules\Travel\Http\Controllers\TravelController;
use Modules\Travel\Http\Controllers\TravelSettingsController;

Route::middleware(['auth'])->group(function () {
    Route::prefix('travel')->group(function () {
        Route::get('/', [TravelController::class, 'index'])->name('travel.index');
        Route::post('/search', [TravelController::class, 'search'])->name('travel.search');
        Route::get('/flights', [TravelController::class, 'flightResults'])->name('travel.flights');
        Route::get('/hotels', [TravelController::class, 'hotelResults'])->name('travel.hotels');
        Route::post('/favorite', [TravelController::class, 'toggleFavorite'])->name('travel.favorite');
        Route::post('/book', [TravelController::class, 'book'])->name('travel.book');
        Route::get('/bookings', [TravelController::class, 'getBookings'])->name('travel.bookings');
        Route::get('/favorites', [TravelController::class, 'getFavorites'])->name('travel.favorites');
        
        // Settings routes
        Route::get('/settings', [TravelSettingsController::class, 'index'])->name('travel.settings');
        Route::post('/settings', [TravelSettingsController::class, 'update'])->name('travel.settings.update');
    });
});
