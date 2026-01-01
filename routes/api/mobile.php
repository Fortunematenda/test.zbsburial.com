<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| MOBILE SESSION ROUTES
|--------------------------------------------------------------------------
| Routes for mobile app session management (validate, refresh, logout)
| All routes require Sanctum authentication
*/

/*
|--------------------------------------------------------------------------
| MOBILE SESSION ENDPOINTS (now using central auth)
|--------------------------------------------------------------------------
*/
Route::post('/mobile/session/validate', function (Request $request) {
    try {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'status'  => 'error',
                'message' => 'User not authenticated'
            ], 401);
        }

        if (!$user->email_verified_at) {
            return response()->json([
                'status'  => 'error',
                'message' => 'User account not verified'
            ], 401);
        }

        $sessionTimeout = 7 * 24 * 60 * 60;
        $lastActivity   = $user->last_activity_at;

        if ($lastActivity && (time() - strtotime($lastActivity)) > $sessionTimeout) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Session expired - please login again'
            ], 401);
        }

        $user->update(['last_activity_at' => now()]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Session valid',
            'user'    => [
                'id'    => $user->id,
                'name'  => $user->first_name . ' ' . $user->last_name,
                'email' => $user->email,
                'role'  => $user->role
            ]
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'status'  => 'error',
            'message' => 'Session validation failed: ' . $e->getMessage()
        ], 500);
    }
})->middleware('auth:sanctum');

Route::post('/mobile/session/refresh', function (Request $request) {
    try {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'status'  => 'error',
                'message' => 'User not authenticated'
            ], 401);
        }

        $user->update(['last_activity_at' => now()]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Session refreshed successfully',
            'data'    => [
                'user'        => [
                    'id'    => $user->id,
                    'name'  => $user->first_name . ' ' . $user->last_name,
                    'email' => $user->email,
                    'role'  => $user->role
                ],
                'refreshed_at'=> now()->toISOString()
            ]
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'status'  => 'error',
            'message' => 'Session refresh failed: ' . $e->getMessage()
        ], 500);
    }
})->middleware('auth:sanctum');

Route::post('/mobile/session/logout', function (Request $request) {
    try {
        $user = $request->user();
        if ($user) {
            $user->update([
                'last_activity_at' => null,
                'logout_at'        => now()
            ]);
        }

        return response()->json([
            'status'  => 'success',
            'message' => 'Logged out successfully'
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'status'  => 'error',
            'message' => 'Logout failed: ' . $e->getMessage()
        ], 500);
    }
})->middleware('auth:sanctum');

