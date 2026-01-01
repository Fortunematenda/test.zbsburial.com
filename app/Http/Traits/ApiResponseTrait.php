<?php

namespace App\Http\Traits;

trait ApiResponseTrait
{
    /**
     * Return a successful JSON response
     * 
     * @param mixed $data
     * @param string|null $message
     * @param int $code
     * @return \Illuminate\Http\JsonResponse
     */
    protected function success($data = null, ?string $message = null, int $code = 200)
    {
        $response = [
            'success' => true,
        ];

        if ($message !== null) {
            $response['message'] = $message;
        }

        if ($data !== null) {
            $response['data'] = $data;
        }

        return response()->json($response, $code);
    }

    /**
     * Return an error JSON response
     * 
     * @param string $message
     * @param int $code
     * @param mixed $errors
     * @return \Illuminate\Http\JsonResponse
     */
    protected function error(string $message, int $code = 400, $errors = null)
    {
        $response = [
            'success' => false,
            'message' => $message,
        ];

        if ($errors !== null) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $code);
    }

    /**
     * Return a JSON response with status field (for backward compatibility)
     * 
     * @param string $status 'success' or 'error'
     * @param string|null $message
     * @param mixed $data
     * @param int $code
     * @return \Illuminate\Http\JsonResponse
     */
    protected function responseWithStatus(string $status, ?string $message = null, $data = null, int $code = 200)
    {
        $response = [
            'status' => $status,
        ];

        if ($message !== null) {
            $response['message'] = $message;
        }

        if ($data !== null) {
            $response['data'] = $data;
        }

        return response()->json($response, $code);
    }

    /**
     * Return an unauthorized response
     * 
     * @param string $message
     * @return \Illuminate\Http\JsonResponse
     */
    protected function unauthorized(?string $message = null)
    {
        return $this->error($message ?? 'User not authenticated', 401);
    }

    /**
     * Return a not found response
     * 
     * @param string $message
     * @return \Illuminate\Http\JsonResponse
     */
    protected function notFound(?string $message = null)
    {
        return $this->error($message ?? 'Resource not found', 404);
    }

    /**
     * Return a validation error response
     * 
     * @param \Illuminate\Contracts\Validation\Validator|array $errors
     * @param string|null $message
     * @return \Illuminate\Http\JsonResponse
     */
    protected function validationError($errors, ?string $message = null)
    {
        $errorArray = is_array($errors) ? $errors : $errors->errors();
        
        return response()->json([
            'success' => false,
            'message' => $message ?? 'Validation failed',
            'errors' => $errorArray,
        ], 422);
    }

    /**
     * Return a server error response
     * 
     * @param string|null $message
     * @param \Throwable|null $exception
     * @return \Illuminate\Http\JsonResponse
     */
    protected function serverError(?string $message = null, ?\Throwable $exception = null)
    {
        $errorMessage = $message ?? 'An unexpected error occurred';
        
        // Log the exception if provided
        if ($exception !== null) {
            \Illuminate\Support\Facades\Log::error($errorMessage, [
                'exception' => get_class($exception),
                'message' => $exception->getMessage(),
                'file' => $exception->getFile(),
                'line' => $exception->getLine(),
            ]);
        }

        // Only expose exception message in development
        if (config('app.debug') && $exception !== null) {
            $errorMessage = $exception->getMessage();
        }

        return $this->error($errorMessage, 500);
    }
}

