<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class HelpController extends Controller
{
    public function submit(Request $request)
    {
        // Handle help form submission
        return response()->json([
            'status' => 'success',
            'message' => 'Help request submitted successfully'
        ]);
    }
}


