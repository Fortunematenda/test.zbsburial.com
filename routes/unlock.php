<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;

// Unlock customer information endpoint
Route::post('/unlock-customer-info', function (Request $request) {
    try {
        // Get user from Authorization header
        $authHeader = $request->header('Authorization');
        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            return response()->json([
                'status' => 'error',
                'message' => 'User not authenticated'
            ], 401);
        }
        
        $token = substr($authHeader, 7); // Remove 'Bearer ' prefix
        $tokenParts = explode('-', $token);
        if (count($tokenParts) < 3) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid token format'
            ], 401);
        }
        
        $userId = $tokenParts[2]; // Get user ID from token
        $user = \App\Models\User::find($userId);
        
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'User not found'
            ], 401);
        }
        
        $leadId = $request->input('lead_id');
        $creditsToPay = $request->input('credits', 10); // Default 10 credits to unlock
        
        if (!$leadId) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lead ID is required'
            ], 400);
        }
        
        // Check if already unlocked
        $existingUnlock = \DB::table('lead_unlocks')
            ->where('lead_id', $leadId)
            ->where('provider_id', $userId)
            ->first();
            
        if ($existingUnlock) {
            return response()->json([
                'status' => 'success',
                'message' => 'Customer information already unlocked',
                'data' => ['already_unlocked' => true]
            ]);
        }
        
        // Check if user has enough credits
        if ($user->credits_balance < $creditsToPay) {
            return response()->json([
                'status' => 'error',
                'message' => 'Insufficient credits. You need ' . $creditsToPay . ' credits to unlock customer information.'
            ], 400);
        }
        
        // Deduct credits and create unlock record
        \DB::transaction(function () use ($userId, $leadId, $creditsToPay) {
            // Deduct credits from user
            \DB::table('users')
                ->where('id', $userId)
                ->decrement('credits_balance', $creditsToPay);
            
            // Create unlock record
            \DB::table('lead_unlocks')->insert([
                'lead_id' => $leadId,
                'provider_id' => $userId,
                'credits_paid' => $creditsToPay,
                'unlocked_at' => now(),
                'created_at' => now(),
                'updated_at' => now()
            ]);
        });
        
        return response()->json([
            'status' => 'success',
            'message' => 'Customer information unlocked successfully',
            'data' => [
                'credits_deducted' => $creditsToPay,
                'remaining_credits' => $user->credits_balance - $creditsToPay
            ]
        ]);
        
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage()
        ], 500);
    }
});
