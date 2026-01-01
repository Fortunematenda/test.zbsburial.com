<?php

namespace App\Helpers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use App\Services\StructuredLogService;

/**
 * Centralized API Error Handler
 * Provides consistent error responses across all API endpoints
 */
class ApiErrorHandler
{
    /**
     * Handle and return a standardized error response
     *
     * @param \Throwable $exception The exception that occurred
     * @param string $context Context where the error occurred (e.g., 'lead_creation', 'user_update')
     * @param array $additionalData Additional data to include in logs
     * @param int $statusCode HTTP status code (default: 500)
     * @return JsonResponse
     */
    public static function handle(
        \Throwable $exception,
        string $context = 'api_request',
        array $additionalData = [],
        int $statusCode = 500
    ): JsonResponse {
        // Log the error
        $errorData = array_merge([
            'context' => $context,
            'message' => $exception->getMessage(),
            'file' => $exception->getFile(),
            'line' => $exception->getLine(),
            'trace' => $exception->getTraceAsString(),
        ], $additionalData);

        // Use structured logging if available
        if (class_exists(StructuredLogService::class)) {
            StructuredLogService::logError($context, $errorData);
        } else {
            Log::error("API Error in {$context}", $errorData);
        }

        // Determine user-friendly message
        $userMessage = self::getUserFriendlyMessage($exception, $context);

        // Return standardized error response
        return response()->json([
            'status' => 'error',
            'message' => $userMessage,
            'error_type' => self::getErrorType($exception),
        ], $statusCode);
    }

    /**
     * Handle database connection errors specifically
     *
     * @param \Illuminate\Database\QueryException $exception
     * @return JsonResponse
     */
    public static function handleDatabaseError(\Illuminate\Database\QueryException $exception): JsonResponse
    {
        $message = $exception->getMessage();

        if (str_contains($message, 'No connection could be made') ||
            str_contains($message, 'Connection refused')) {
            return response()->json([
                'status' => 'error',
                'message' => 'Database connection failed. Please ensure MySQL is running.',
                'error_type' => 'database_connection'
            ], 503);
        }

        return self::handle($exception, 'database_error', [], 500);
    }

    /**
     * Handle validation errors
     *
     * @param \Illuminate\Validation\ValidationException $exception
     * @return JsonResponse
     */
    public static function handleValidationError(\Illuminate\Validation\ValidationException $exception): JsonResponse
    {
        return response()->json([
            'status' => 'error',
            'message' => 'Validation failed',
            'errors' => $exception->errors(),
            'error_type' => 'validation_error'
        ], 422);
    }

    /**
     * Handle authentication errors
     *
     * @param string $message Custom message (optional)
     * @return JsonResponse
     */
    public static function handleAuthError(string $message = 'User not authenticated'): JsonResponse
    {
        return response()->json([
            'status' => 'error',
            'message' => $message,
            'error_type' => 'authentication_error'
        ], 401);
    }

    /**
     * Handle not found errors
     *
     * @param string $resource Resource that was not found (e.g., 'Lead', 'User')
     * @param int $id ID of the resource (optional)
     * @return JsonResponse
     */
    public static function handleNotFound(string $resource, ?int $id = null): JsonResponse
    {
        $message = $id 
            ? "{$resource} with ID {$id} not found"
            : "{$resource} not found";

        return response()->json([
            'status' => 'error',
            'message' => $message,
            'error_type' => 'not_found'
        ], 404);
    }

    /**
     * Get user-friendly error message
     *
     * @param \Throwable $exception
     * @param string $context
     * @return string
     */
    private static function getUserFriendlyMessage(\Throwable $exception, string $context): string
    {
        // Don't expose internal errors in production
        if (!config('app.debug')) {
            return match ($context) {
                'lead_creation' => 'Failed to create lead. Please try again.',
                'user_update' => 'Failed to update user information. Please try again.',
                'payment_processing' => 'Payment processing failed. Please try again.',
                'database_error' => 'Database error occurred. Please contact support.',
                default => 'An error occurred. Please try again.',
            };
        }

        // In debug mode, return the actual error message
        return $exception->getMessage();
    }

    /**
     * Get error type from exception
     *
     * @param \Throwable $exception
     * @return string
     */
    private static function getErrorType(\Throwable $exception): string
    {
        return match (true) {
            $exception instanceof \Illuminate\Database\QueryException => 'database_error',
            $exception instanceof \Illuminate\Validation\ValidationException => 'validation_error',
            $exception instanceof \Illuminate\Auth\AuthenticationException => 'authentication_error',
            $exception instanceof \Illuminate\Database\Eloquent\ModelNotFoundException => 'not_found',
            default => 'server_error',
        };
    }

    /**
     * Return success response (for consistency)
     *
     * @param mixed $data Response data
     * @param string $message Success message
     * @param int $statusCode HTTP status code (default: 200)
     * @return JsonResponse
     */
    public static function success($data = null, string $message = 'Success', int $statusCode = 200): JsonResponse
    {
        $response = [
            'status' => 'success',
            'message' => $message,
        ];

        if ($data !== null) {
            $response['data'] = $data;
        }

        return response()->json($response, $statusCode);
    }
}

