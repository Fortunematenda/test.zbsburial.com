<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProfileController;

/*
|--------------------------------------------------------------------------
| NOTIFICATION ROUTES
|--------------------------------------------------------------------------
| Routes for managing notifications and push tokens
| All routes require Sanctum authentication
*/

/*
|--------------------------------------------------------------------------
| WEB NOTIFICATION ROUTES (for web interface)
|--------------------------------------------------------------------------
| These routes are used by the web interface and require authentication
*/
Route::middleware('auth:sanctum')->group(function () {
    // notifications
    Route::prefix('notifications')->group(function () {
        Route::get('/', [ProfileController::class, 'getNotifications']);
        Route::put('{id}/read', [ProfileController::class, 'markNotificationAsRead']);
        Route::put('read-all', [ProfileController::class, 'markAllAsRead']);
        Route::delete('clear-all', [ProfileController::class, 'clearAllNotifications']);
        Route::get('unread-count', [ProfileController::class, 'getUnreadCount']);
        Route::post('register-token', [ProfileController::class, 'registerPushToken']);
    });
});

