<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| DEBUG ROUTES
|--------------------------------------------------------------------------
| Routes for debugging and development purposes
| These routes should be disabled in production
*/

/*
|--------------------------------------------------------------------------
| DEBUG / TOKEN
|--------------------------------------------------------------------------
| Note: This route should be removed or protected in production
*/
if (app()->environment('local', 'testing')) {
    Route::get('/debug-token', function (Request $request) {
        try {
            $user = $request->user();

            return response()->json([
                'success'     => true,
                'auth_header' => $request->header('Authorization'),
                'user'        => $user ? [
                    'id'    => $user->id,
                    'email' => $user->email,
                    'name'  => trim(($user->first_name ?? '') . ' ' . ($user->last_name ?? ''))
                ] : null,
                'message'     => 'Token debug successful'
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Token debug failed: ' . $e->getMessage()
            ], 500);
        }
    });
}

