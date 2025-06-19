<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;

class Roles
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string  ...$roles
     * @return mixed
     */
    public function handle($request, Closure $next, ...$roles)
    {
       
        $user = Auth::user();

        // Check if the user is authenticated
        if (!$user) {
            return redirect('/login'); // Redirect to login if not authenticated
        }

        // Check if the user's role matches any of the allowed roles
        if (!in_array($user->role, $roles)) {
            abort(403, 'Unauthorized action.'); // Return 403 if not authorized
        }

        return $next($request);
    }
}

