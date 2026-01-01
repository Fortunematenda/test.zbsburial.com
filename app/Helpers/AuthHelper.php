<?php

namespace App\Helpers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\User;

class AuthHelper
{
    /**
     * Get authenticated user from request
     * 
     * SECURITY UPDATE: Legacy token pattern removed - only Sanctum tokens accepted
     * 
     * @param Request $request
     * @return User|null
     */
    public static function getAuthenticatedUser(Request $request): ?User
    {
        // 1) normal sanctum user (route has auth:sanctum)
        if ($request->user()) {
            return $request->user();
        }

        // 2) bearer from header
        $authHeader = $request->header('Authorization');
        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            return null;
        }

        $token = trim(substr($authHeader, 7));

        // guard against rubbish from mobile
        if ($token === '' || $token === 'undefined' || $token === 'null') {
            return null;
        }

        // 3) try Sanctum table directly (ONLY Sanctum tokens are allowed)
        try {
            $tokenHash = hash('sha256', $token);

            $pat = DB::table('personal_access_tokens')
                ->where('token', $tokenHash)
                ->where('tokenable_type', 'App\\Models\\User')
                ->first();

            if ($pat) {
                $user = User::find($pat->tokenable_id);
                if ($user) {
                    return $user;
                }
            }
        } catch (\Throwable $e) {
            // Log error but don't expose details
            Log::warning('Token validation failed', ['error' => $e->getMessage()]);
        }

        // Legacy token pattern removed for security - only Sanctum tokens accepted
        return null;
    }
}

