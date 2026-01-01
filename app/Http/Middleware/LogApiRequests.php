<?php

namespace App\Http\Middleware;

use App\Services\StructuredLogService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware to log all API requests and responses
 */
class LogApiRequests
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $startTime = microtime(true);
        $endpoint = $request->route()?->getName() ?? $request->path();

        // Log request
        StructuredLogService::logApiRequest($request, $endpoint);

        $response = $next($request);

        // Calculate duration
        $duration = (microtime(true) - $startTime) * 1000; // Convert to milliseconds

        // Log response
        StructuredLogService::logApiResponse($endpoint, $response->getStatusCode(), [
            'duration_ms' => round($duration, 2),
        ]);

        // Log slow requests (> 1 second)
        if ($duration > 1000) {
            StructuredLogService::logPerformance(
                $endpoint,
                $duration,
                ['method' => $request->method()]
            );
        }

        return $response;
    }
}

