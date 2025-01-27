<?php

namespace Modules\Travel\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Modules\Travel\Services\AmadeusService;
use Modules\Travel\Entities\TravelSearch;
use Modules\Travel\Entities\TravelBooking;
use Modules\Travel\Entities\TravelFavorite;

class TravelController extends Controller
{
    protected $amadeusService;
    protected $perPage = 20;

    public function __construct(AmadeusService $amadeusService)
    {
        $this->amadeusService = $amadeusService;
    }

    public function index()
    {
        return view('travel::index');
    }

    public function flightResults(Request $request)
    {
        $searchId = $request->get('search_id');
        $search = TravelSearch::findOrFail($searchId);
        
        // Get results from Amadeus
        $results = $this->amadeusService->search([
            'type' => 'flight',
            'from_location' => $search->from_location,
            'to_location' => $search->to_location,
            'departure_date' => $search->departure_date->format('Y-m-d'),
            'return_date' => $search->return_date?->format('Y-m-d'),
            'adults' => $search->adults,
            'children' => $search->children
        ]);

        // Apply filters
        if ($request->has('sort')) {
            $results = $this->sortFlightResults($results, $request->get('sort'));
        }

        if ($request->has('stops')) {
            $results = $this->filterFlightsByStops($results, $request->get('stops'));
        }

        if ($request->has('price_range')) {
            $results = $this->filterByPriceRange($results, $request->get('price_range'));
        }

        if ($request->has('airlines')) {
            $results = $this->filterByAirlines($results, $request->get('airlines'));
        }

        // Paginate results
        $page = $request->get('page', 1);
        $paginatedResults = array_slice($results, ($page - 1) * $this->perPage, $this->perPage);
        $totalPages = ceil(count($results) / $this->perPage);

        return view('travel::flights.results', [
            'search' => $search,
            'results' => $paginatedResults,
            'currentPage' => $page,
            'totalPages' => $totalPages,
            'filters' => $this->getFlightFilters($results)
        ]);
    }

    public function hotelResults(Request $request)
    {
        $searchId = $request->get('search_id');
        $search = TravelSearch::findOrFail($searchId);
        
        // Get results from Amadeus
        $results = $this->amadeusService->search([
            'type' => 'hotel',
            'to_location' => $search->to_location,
            'departure_date' => $search->departure_date->format('Y-m-d'),
            'return_date' => $search->return_date->format('Y-m-d'),
            'adults' => $search->adults,
            'rooms' => $search->rooms
        ]);

        // Apply filters
        if ($request->has('sort')) {
            $results = $this->sortHotelResults($results, $request->get('sort'));
        }

        if ($request->has('rating')) {
            $results = $this->filterByRating($results, $request->get('rating'));
        }

        if ($request->has('price_range')) {
            $results = $this->filterByPriceRange($results, $request->get('price_range'));
        }

        if ($request->has('amenities')) {
            $results = $this->filterByAmenities($results, $request->get('amenities'));
        }

        // Paginate results
        $page = $request->get('page', 1);
        $paginatedResults = array_slice($results, ($page - 1) * $this->perPage, $this->perPage);
        $totalPages = ceil(count($results) / $this->perPage);

        return view('travel::hotels.results', [
            'search' => $search,
            'results' => $paginatedResults,
            'currentPage' => $page,
            'totalPages' => $totalPages,
            'filters' => $this->getHotelFilters($results)
        ]);
    }

    protected function sortFlightResults($results, $sortBy)
    {
        return collect($results)->sortBy(function ($flight) use ($sortBy) {
            switch ($sortBy) {
                case 'price_asc':
                    return $flight['price']['total'];
                case 'price_desc':
                    return -$flight['price']['total'];
                case 'duration':
                    return $flight['itineraries'][0]['duration'];
                case 'stops':
                    return count($flight['itineraries'][0]['segments']);
                default:
                    return $flight['price']['total'];
            }
        })->values()->all();
    }

    protected function sortHotelResults($results, $sortBy)
    {
        return collect($results)->sortBy(function ($hotel) use ($sortBy) {
            switch ($sortBy) {
                case 'price_asc':
                    return $hotel['offers'][0]['price']['total'];
                case 'price_desc':
                    return -$hotel['offers'][0]['price']['total'];
                case 'rating':
                    return -$hotel['rating'];
                default:
                    return $hotel['offers'][0]['price']['total'];
            }
        })->values()->all();
    }

    protected function filterFlightsByStops($results, $stops)
    {
        return array_filter($results, function ($flight) use ($stops) {
            $segments = count($flight['itineraries'][0]['segments']);
            return in_array($segments - 1, $stops); // segments - 1 = number of stops
        });
    }

    protected function filterByPriceRange($results, $range)
    {
        [$min, $max] = explode('-', $range);
        return array_filter($results, function ($result) use ($min, $max) {
            $price = $result['price']['total'];
            return $price >= $min && $price <= $max;
        });
    }

    protected function filterByAirlines($results, $airlines)
    {
        return array_filter($results, function ($flight) use ($airlines) {
            return in_array($flight['validatingAirlineCodes'][0], $airlines);
        });
    }

    protected function filterByRating($results, $rating)
    {
        return array_filter($results, function ($hotel) use ($rating) {
            return $hotel['rating'] >= $rating;
        });
    }

    protected function filterByAmenities($results, $amenities)
    {
        return array_filter($results, function ($hotel) use ($amenities) {
            return count(array_intersect($hotel['amenities'], $amenities)) === count($amenities);
        });
    }

    protected function getFlightFilters($results)
    {
        $airlines = array_unique(array_map(function ($flight) {
            return $flight['validatingAirlineCodes'][0];
        }, $results));

        $prices = array_map(function ($flight) {
            return $flight['price']['total'];
        }, $results);

        return [
            'airlines' => $airlines,
            'price_range' => [
                'min' => min($prices),
                'max' => max($prices)
            ],
            'stops' => [0, 1, 2] // Available stop options
        ];
    }

    protected function getHotelFilters($results)
    {
        $amenities = [];
        foreach ($results as $hotel) {
            $amenities = array_merge($amenities, $hotel['amenities'] ?? []);
        }
        $amenities = array_unique($amenities);

        $prices = array_map(function ($hotel) {
            return $hotel['offers'][0]['price']['total'];
        }, $results);

        return [
            'amenities' => $amenities,
            'price_range' => [
                'min' => min($prices),
                'max' => max($prices)
            ],
            'ratings' => [3, 4, 5] // Available rating options
        ];
    }

    // ... (keep existing methods)
}
