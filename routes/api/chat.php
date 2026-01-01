<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\LeadsController;

/*
|--------------------------------------------------------------------------
| CHAT / MESSAGING ROUTES
|--------------------------------------------------------------------------
| Routes for messaging and conversations
| Note: Mobile chat routes (send-message, chat-messages, etc.) are in leads.php
| These are web interface routes
*/

/*
|--------------------------------------------------------------------------
| WEB MESSAGE ROUTES (for web interface)
|--------------------------------------------------------------------------
| These routes are used by the web interface and require authentication
*/
Route::middleware('auth:sanctum')->group(function () {
    // messages / chat
    Route::prefix('messages')->group(function () {
        Route::get('conversations', [LeadsController::class, 'getConversations']);
        Route::get('{conversationId}', [LeadsController::class, 'getMessages']);
        Route::post('/', [LeadsController::class, 'sendMessage']);
        Route::put('{conversationId}/read', [LeadsController::class, 'markAsRead']);
    });
});

