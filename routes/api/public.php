<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Models\User;
use App\Helpers\CacheHelper;
use App\Helpers\ApiErrorHandler;
use App\Http\Controllers\CustomerController;

/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES (No Authentication Required)
|--------------------------------------------------------------------------
| These routes are accessible without authentication
*/

// Simple health check for mobile
Route::get('/test-connection', function () {
    return response()->json([
        'status'    => 'success',
        'message'   => 'Mobile app can connect to Laravel API',
        'timestamp' => now()->toISOString(),
        'server'    => 'Laravel API Server'
    ]);
});

// Count users (no auth)
Route::get('/user-count', function () {
    return response()->json([
        'user_count' => User::count()
    ]);
});

// Get all services for registration screen (public)
Route::get('/all-services', function () {
    try {
        // Use CacheHelper for better performance - services rarely change
        $services = CacheHelper::getServices();
        return response()->json([
            'success' => true,
            'data'    => $services
        ]);
    } catch (\Illuminate\Database\QueryException $dbError) {
        return ApiErrorHandler::handleDatabaseError($dbError);
    } catch (\Throwable $e) {
        return ApiErrorHandler::handle($e, 'load_services', [], 500);
    }
});

// Get service questions (public)
Route::post('/service-questions', function (Request $request) {
    try {
        $request->validate([
            'service_id' => 'required|integer',
        ]);

        $service_id = (int)$request->service_id;
        $questions = \App\Models\ServiceQuestionModel::select(
                'service_questions.service_id',
                'service_questions.question',
                'service_questions.id as question_id',
                'service_possible_answers.service_answer',
                'service_possible_answers.id'
            )
            ->join('service_possible_answers', 'service_possible_answers.service_questions_id', '=', 'service_questions.id')
            ->where('service_questions.service_id', $service_id)
            ->get()
            ->groupBy('question')
            ->map(function ($items, $question) {
                return [
                    'question_id' => $items->first()->question_id,
                    'question'    => $question,
                    'answers'     => $items->pluck('service_answer')->all()
                ];
            })
            ->values();

        return response()->json([
            'success'   => true,
            'questions' => $questions,
            'service_id'=> $service_id
        ], 200);
    } catch (\Illuminate\Validation\ValidationException $e) {
        return ApiErrorHandler::handleValidationError($e);
    } catch (\Throwable $e) {
        return ApiErrorHandler::handle($e, 'service_questions', [], 500);
    }
});

