<?php

namespace Modules\Travel\Services;

use Amadeus\Client;
use Amadeus\Configuration;
use Modules\Travel\Entities\TravelSetting;

class AmadeusService
{
    protected $client;
    protected $settings;

    public function __construct()
    {
        $this->client = $this->initializeClient();
        $this->settings = $this->getUserSettings();
    }

    protected function initializeClient()
    {
        $configuration = new Configuration(
            'OQWgWw3DXkO9fEyEjWbZmXQ5r8XTv8Sk',
            'sD8YFjiAZtHTGcSM'
        );

        return new Client($configuration);
    }

    protected function getUserSettings()
    {
        return TravelSetting::firstOrCreate(
            ['user_id' => auth()->id()],
            [
                'commission_type' => 'percentage',
                'commission_value' => 10.00,
                'service_fee' => 50.00
            ]
        );
    }

    public function search(array $params)
    {
        if ($params['type'] === 'flight') {
            return $this->searchFlights($params);
        }
        return $this->searchHotels($params);
    }

    protected function searchFlights(array $params)
    {
        try {
            $response = $this->client->shopping->flightOffersSearch->get([
                'originLocationCode' => $params['from_location'],
                'destinationLocationCode' => $params['to_location'],
                'departureDate' => $params['departure_date'],
                'returnDate' => $params['return_date'] ?? null,
                'adults' => $params['adults'],
                'children' => $params['children'] ?? 0,
                'max' => 100
            ]);

            // Add commission and service fee to each result
            $results = collect($response->data)->map(function ($flight) {
                $basePrice = floatval($flight['price']['total']);
                $finalPrice = $this->settings->calculateFinalPrice($basePrice);
                
                $flight['price']['basePrice'] = $basePrice;
                $flight['price']['serviceFee'] = $this->settings->service_fee;
                $flight['price']['commission'] = $this->settings->commission_type === 'percentage'
                    ? $basePrice * ($this->settings->commission_value / 100)
                    : $this->settings->commission_value;
                $flight['price']['total'] = $finalPrice;
                
                return $flight;
            })->toArray();

            return $results;
        } catch (\Exception $e) {
            \Log::error('Amadeus Flight Search Error: ' . $e->getMessage());
            throw $e;
        }
    }

    protected function searchHotels(array $params)
    {
        try {
            $response = $this->client->shopping->hotelOffers->get([
                'cityCode' => $params['to_location'],
                'checkInDate' => $params['departure_date'],
                'checkOutDate' => $params['return_date'],
                'adults' => $params['adults'],
                'roomQuantity' => $params['rooms']
            ]);

            // Add commission and service fee to each result
            $results = collect($response->data)->map(function ($hotel) {
                $basePrice = floatval($hotel['offers'][0]['price']['total']);
                $finalPrice = $this->settings->calculateFinalPrice($basePrice);
                
                $hotel['offers'][0]['price']['basePrice'] = $basePrice;
                $hotel['offers'][0]['price']['serviceFee'] = $this->settings->service_fee;
                $hotel['offers'][0]['price']['commission'] = $this->settings->commission_type === 'percentage'
                    ? $basePrice * ($this->settings->commission_value / 100)
                    : $this->settings->commission_value;
                $hotel['offers'][0]['price']['total'] = $finalPrice;
                
                return $hotel;
            })->toArray();

            return $results;
        } catch (\Exception $e) {
            \Log::error('Amadeus Hotel Search Error: ' . $e->getMessage());
            throw $e;
        }
    }

    public function createBooking(array $params)
    {
        try {
            if ($params['type'] === 'flight') {
                $response = $this->client->booking->flightOrders->post(
                    json_encode($params['booking_details'])
                );
            } else {
                $response = $this->client->booking->hotelBookings->post(
                    json_encode($params['booking_details'])
                );
            }

            $basePrice = floatval($response->data['price']['total']);
            $finalPrice = $this->settings->calculateFinalPrice($basePrice);

            return [
                'reference' => $response->data['id'],
                'base_price' => $basePrice,
                'service_fee' => $this->settings->service_fee,
                'commission' => $this->settings->commission_type === 'percentage'
                    ? $basePrice * ($this->settings->commission_value / 100)
                    : $this->settings->commission_value,
                'total_price' => $finalPrice,
                'currency' => $response->data['price']['currency']
            ];
        } catch (\Exception $e) {
            \Log::error('Amadeus Booking Error: ' . $e->getMessage());
            throw $e;
        }
    }

    public function getFlightInspirations($origin)
    {
        try {
            return $this->client->shopping->flightDestinations->get([
                'origin' => $origin
            ]);
        } catch (\Exception $e) {
            \Log::error('Flight Inspiration Error: ' . $e->getMessage());
            throw $e;
        }
    }

    public function getCheapestDates($origin, $destination)
    {
        try {
            return $this->client->shopping->flightDates->get([
                'origin' => $origin,
                'destination' => $destination
            ]);
        } catch (\Exception $e) {
            \Log::error('Cheapest Dates Error: ' . $e->getMessage());
            throw $e;
        }
    }

    public function getFlightStatus($carrierCode, $flightNumber, $date)
    {
        try {
            return $this->client->schedule->flights->get([
                'carrierCode' => $carrierCode,
                'flightNumber' => $flightNumber,
                'scheduledDepartureDate' => $date
            ]);
        } catch (\Exception $e) {
            \Log::error('Flight Status Error: ' . $e->getMessage());
            throw $e;
        }
    }
}
