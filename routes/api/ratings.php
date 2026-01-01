<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CustomerController;

/*
|--------------------------------------------------------------------------
| RATING & REVIEW ROUTES
|--------------------------------------------------------------------------
| Routes for submitting and managing ratings/reviews
| All routes require Sanctum authentication unless otherwise noted
*/

/*
|--------------------------------------------------------------------------
| WEB RATING ROUTES (for web interface)
|--------------------------------------------------------------------------
| These routes are used by the web interface and require authentication
*/
Route::middleware('auth:sanctum')->group(function () {
    // ratings
    Route::prefix('ratings')->group(function () {
        Route::get('{userId}', [CustomerController::class, 'getRatings']);
        Route::post('/', [CustomerController::class, 'insertRatings']); // create
        Route::put('{id}', [CustomerController::class, 'updateRating']);
    });
});

/*
|--------------------------------------------------------------------------
| SUBMIT REVIEW/RATING (mobile)
|--------------------------------------------------------------------------
*/
Route::post('/submit-review', function (Request $request) {
    try {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'status'  => 'error',
                'message' => 'User not authenticated'
            ], 401);
        }

        $request->validate([
            'expert_id' => 'required|integer',
            'lead_id'   => 'required|integer',
            'rating'    => 'required|integer|min:1|max:5',
            'comment'   => 'nullable|string|max:1000',
        ]);

        // Check if user already reviewed this expert for this lead
        $existingReview = \App\Models\RatingsModel::where('from_user_id', $user->id)
            ->where('to_user_id', $request->expert_id)
            ->where('lead_id', $request->lead_id)
            ->first();

        if ($existingReview) {
            // Update existing review
            \App\Models\RatingsModel::where('id', $existingReview->id)->update([
                'rating' => $request->rating,
                'comment' => $request->comment,
            ]);
        } else {
            // Create new review
            \App\Models\RatingsModel::create([
                'from_user_id' => $user->id,
                'to_user_id' => $request->expert_id,
                'lead_id' => $request->lead_id,
                'rating' => $request->rating,
                'comment' => $request->comment,
                'date_entered' => date('Y-m-d H:i:s'),
            ]);
        }

        return response()->json([
            'status'  => 'success',
            'message' => 'Review submitted successfully'
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'status'  => 'error',
            'message' => $e->getMessage()
        ], 500);
    }
})->middleware('auth:sanctum');

