<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

class UpdateLastSeen
{
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();

        if ($user && $user instanceof \Illuminate\Database\Eloquent\Model) {
            // Update using property then save (if update() not working)
            $user->last_seen = now();
            $user->save();
        }

        return $next($request);
    }
}
