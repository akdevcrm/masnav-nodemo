<?php

return [
    'name' => 'Travel',
    'amadeus' => [
        'client_id' => env('AMADEUS_CLIENT_ID'),
        'client_secret' => env('AMADEUS_CLIENT_SECRET'),
        'environment' => env('AMADEUS_ENVIRONMENT', 'test')
    ]
];
