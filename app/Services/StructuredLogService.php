<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;

/**
 * Structured Logging Service
 * 
 * Provides consistent, structured logging throughout the application
 * with context, user information, and standardized formats.
 */
class StructuredLogService
{
    /**
     * Log an authentication event
     * 
     * @param string $event Event type (login, logout, register, etc.)
     * @param mixed $userId User ID
     * @param array $context Additional context
     * @param bool $success Whether the operation was successful
     */
    public static function logAuth(string $event, $userId = null, array $context = [], bool $success = true): void
    {
        $level = $success ? 'info' : 'warning';
        
        Log::$level("Authentication: {$event}", array_merge([
            'event' => $event,
            'user_id' => $userId,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'timestamp' => now()->toIso8601String(),
        ], $context));
    }

    /**
     * Log an API request
     * 
     * @param Request $request The request object
     * @param string $endpoint Endpoint name
     * @param array $context Additional context
     */
    public static function logApiRequest(Request $request, string $endpoint, array $context = []): void
    {
        Log::info("API Request: {$endpoint}", array_merge([
            'endpoint' => $endpoint,
            'method' => $request->method(),
            'url' => $request->fullUrl(),
            'user_id' => $request->user()?->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'timestamp' => now()->toIso8601String(),
        ], $context));
    }

    /**
     * Log an API response
     * 
     * @param string $endpoint Endpoint name
     * @param int $statusCode HTTP status code
     * @param array $context Additional context
     */
    public static function logApiResponse(string $endpoint, int $statusCode, array $context = []): void
    {
        $level = $statusCode >= 500 ? 'error' : ($statusCode >= 400 ? 'warning' : 'info');
        
        Log::$level("API Response: {$endpoint}", array_merge([
            'endpoint' => $endpoint,
            'status_code' => $statusCode,
            'timestamp' => now()->toIso8601String(),
        ], $context));
    }

    /**
     * Log an error with full context
     * 
     * @param \Throwable $exception The exception
     * @param array $context Additional context
     * @param string $level Log level (error, critical, emergency)
     */
    public static function logError(\Throwable $exception, array $context = [], string $level = 'error'): void
    {
        Log::$level("Error: {$exception->getMessage()}", array_merge([
            'exception' => get_class($exception),
            'message' => $exception->getMessage(),
            'file' => $exception->getFile(),
            'line' => $exception->getLine(),
            'trace' => $exception->getTraceAsString(),
            'user_id' => request()->user()?->id,
            'ip_address' => request()->ip(),
            'url' => request()->fullUrl(),
            'method' => request()->method(),
            'timestamp' => now()->toIso8601String(),
        ], $context));
    }

    /**
     * Log a lead-related event
     * 
     * @param string $event Event type (created, updated, deleted, etc.)
     * @param int $leadId Lead ID
     * @param mixed $userId User ID
     * @param array $context Additional context
     */
    public static function logLead(string $event, int $leadId, $userId = null, array $context = []): void
    {
        Log::info("Lead: {$event}", array_merge([
            'event' => $event,
            'lead_id' => $leadId,
            'user_id' => $userId,
            'ip_address' => request()->ip(),
            'timestamp' => now()->toIso8601String(),
        ], $context));
    }

    /**
     * Log a payment/credit transaction
     * 
     * @param string $event Event type (purchase, refund, unlock, etc.)
     * @param mixed $userId User ID
     * @param float $amount Transaction amount
     * @param array $context Additional context
     */
    public static function logTransaction(string $event, $userId, float $amount, array $context = []): void
    {
        Log::info("Transaction: {$event}", array_merge([
            'event' => $event,
            'user_id' => $userId,
            'amount' => $amount,
            'ip_address' => request()->ip(),
            'timestamp' => now()->toIso8601String(),
        ], $context));
    }

    /**
     * Log a security-related event
     * 
     * @param string $event Event type (unauthorized_access, rate_limit, etc.)
     * @param array $context Additional context
     */
    public static function logSecurity(string $event, array $context = []): void
    {
        Log::warning("Security: {$event}", array_merge([
            'event' => $event,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'url' => request()->fullUrl(),
            'user_id' => request()->user()?->id,
            'timestamp' => now()->toIso8601String(),
        ], $context));
    }

    /**
     * Log a performance metric
     * 
     * @param string $metric Metric name
     * @param float $duration Duration in milliseconds
     * @param array $context Additional context
     */
    public static function logPerformance(string $metric, float $duration, array $context = []): void
    {
        $level = $duration > 1000 ? 'warning' : 'debug'; // Warn if > 1 second
        
        Log::$level("Performance: {$metric}", array_merge([
            'metric' => $metric,
            'duration_ms' => $duration,
            'timestamp' => now()->toIso8601String(),
        ], $context));
    }

    /**
     * Log an image upload event
     * 
     * @param string $event Event type (uploaded, validation_failed, etc.)
     * @param int|null $leadId Lead ID if applicable
     * @param mixed $userId User ID
     * @param array $context Additional context
     */
    public static function logImageUpload(string $event, ?int $leadId = null, $userId = null, array $context = []): void
    {
        $level = strpos($event, 'failed') !== false ? 'warning' : 'info';
        
        Log::$level("Image Upload: {$event}", array_merge([
            'event' => $event,
            'lead_id' => $leadId,
            'user_id' => $userId,
            'ip_address' => request()->ip(),
            'timestamp' => now()->toIso8601String(),
        ], $context));
    }

    /**
     * Log a cache event
     * 
     * @param string $event Event type (hit, miss, cleared, etc.)
     * @param string $key Cache key
     * @param array $context Additional context
     */
    public static function logCache(string $event, string $key, array $context = []): void
    {
        Log::debug("Cache: {$event}", array_merge([
            'event' => $event,
            'key' => $key,
            'timestamp' => now()->toIso8601String(),
        ], $context));
    }
}

