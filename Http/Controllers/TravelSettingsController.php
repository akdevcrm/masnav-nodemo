<?php

namespace Modules\Travel\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Modules\Travel\Entities\TravelSetting;

class TravelSettingsController extends Controller
{
    public function index()
    {
        $settings = TravelSetting::firstOrCreate(
            ['user_id' => auth()->id()],
            [
                'commission_type' => 'percentage',
                'commission_value' => 10.00,
                'service_fee' => 50.00
            ]
        );

        return view('travel::settings.index', compact('settings'));
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'commission_type' => 'required|in:percentage,fixed',
            'commission_value' => 'required|numeric|min:0',
            'service_fee' => 'required|numeric|min:0'
        ]);

        $settings = TravelSetting::updateOrCreate(
            ['user_id' => auth()->id()],
            $validated
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Settings updated successfully',
            'settings' => $settings
        ]);
    }
}
