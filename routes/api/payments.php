<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use App\Models\StripeProductsModel;
use App\Models\CreditsTrailModel;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PurchaseController;
use Stripe\Stripe;
use Stripe\Checkout\Session;

/*
|--------------------------------------------------------------------------
| PAYMENT & CREDITS ROUTES
|--------------------------------------------------------------------------
| Routes for payment processing, credit purchases, and transaction history
| All routes require Sanctum authentication unless otherwise noted
*/

/*
|--------------------------------------------------------------------------
| WEB PAYMENT ROUTES (for web interface)
|--------------------------------------------------------------------------
| These routes are used by the web interface and require authentication
*/
Route::middleware('auth:sanctum')->group(function () {
    // payments & credits
    Route::prefix('payments')->group(function () {
        Route::post('purchase-credits', [PurchaseController::class, 'purchase']);
        Route::get('transactions', [ProfileController::class, 'transactionHistory']);
        Route::get('methods', [ProfileController::class, 'getPaymentMethods']);
        Route::post('methods', [ProfileController::class, 'addPaymentMethod']);
    });

    // Credits history endpoint
    Route::get('/credits-history/{userId}', function (Request $request, $userId) {
        try {
            $user = $request->user();
            
            // Check if user is authenticated
            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'User not authenticated'
                ], 401);
            }
            
            // Verify the user is requesting their own history or is an admin
            if ($user->id != $userId && $user->role !== 'Admin') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized to view this history'
                ], 403);
            }

            // Use the same function as desktop version (ProfileController::getCreditHistory)
            // Get credits trail for the user - same as desktop
            $creditsTrail = CreditsTrailModel::where('user_id', $userId)
                ->orderBy('date_entered', 'desc')
                ->limit(100) // Limit to last 100 transactions
                ->get();

            // Enhance with lead information if available
            $history = $creditsTrail->map(function ($item) {
                $leadInfo = null;
                $serviceName = null;
                
                // Get lead information if lead_id exists
                if ($item->lead_id > 0) {
                    $lead = \App\Models\LeadsModel::find($item->lead_id);
                    if ($lead) {
                        $leadInfo = [
                            'description' => $lead->description,
                            'status' => $lead->status,
                        ];
                        
                        // Get service name
                        if ($lead->service_id) {
                            $service = \App\Models\ServicesModel::find($lead->service_id);
                            if ($service) {
                                $serviceName = $service->service_name;
                            }
                        }
                    }
                }

                // Determine transaction type if not set (same logic as desktop)
                $transactionType = $item->transaction_type;
                $creditsValue = (int) $item->credits;
                
                if (empty($transactionType)) {
                    if ($item->lead_id > 0) {
                        // If lead_id exists, it's usage (unlocking/contacting lead)
                        $transactionType = 'usage';
                    } elseif ($creditsValue > 0) {
                        // Positive credits without lead = purchase
                        $transactionType = 'purchase';
                    } else {
                        // Negative credits without lead = adjustment
                        $transactionType = 'adjustment';
                    }
                }

                return [
                    'id' => $item->id,
                    'user_id' => $item->user_id,
                    'lead_id' => $item->lead_id,
                    'credits' => $creditsValue,
                    'transaction_type' => $transactionType,
                    'date_entered' => $item->date_entered ? date('Y-m-d H:i:s', strtotime($item->date_entered)) : null,
                    'entered_by' => $item->entered_by,
                    'lead_description' => $leadInfo['description'] ?? null,
                    'lead_status' => $leadInfo['status'] ?? null,
                    'service_name' => $serviceName,
                ];
            });

            return response()->json([
                'status' => 'success',
                'history' => $history
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to load credits history: ' . $e->getMessage()
            ], 500);
        }
    });

    // Get available credit packages
    Route::get('/mobile/packages', function (Request $request) {
        try {
            $packages = StripeProductsModel::select('id', 'name', 'credits', 'price')
                ->orderBy('credits', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'packages' => $packages,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch packages: ' . $e->getMessage()
            ], 500);
        }
    });

    // Mobile Stripe Checkout
    Route::post('/mobile/create-checkout-session', function (Request $request) {
        try {
            $user = $request->user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            $request->validate([
                'product_id' => 'required|integer|exists:stripe_products,id',
            ]);

            // Set Stripe API key
            Stripe::setApiKey(config('services.stripe.secret'));

            // Get product details
            $productDetails = StripeProductsModel::where('id', $request->product_id)->first();

            if (!$productDetails) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product not found'
                ], 404);
            }

            // Get base URL - try from request first, then fall back to config
            // For mobile devices, we need the actual server URL (not localhost)
            $baseUrl = $request->header('Origin') 
                ?? $request->root() 
                ?? config('app.url');
            
            // If it's localhost, try to get the actual IP or domain from request
            if (strpos($baseUrl, 'localhost') !== false || strpos($baseUrl, '127.0.0.1') !== false) {
                // Check if we have a custom APP_URL set in env
                $envUrl = env('APP_URL');
                if ($envUrl && strpos($envUrl, 'localhost') === false) {
                    $baseUrl = $envUrl;
                } else {
                    // Try to get from request host
                    $host = $request->getHost();
                    $scheme = $request->getScheme();
                    if ($host && $host !== 'localhost' && $host !== '127.0.0.1') {
                        $baseUrl = $scheme . '://' . $host;
                    } else {
                        // Use the configured server URL for mobile devices (WAMP setup)
                        $baseUrl = env('APP_URL', 'http://192.168.1.90:8080');
                    }
                }
            }

            // Create Stripe Checkout session
            $checkout_session = Session::create([
                'payment_method_types' => ['card'],
                'line_items' => [[
                    'price_data' => [
                        'currency' => 'zar',
                        'product_data' => [
                            'name' => $productDetails->name,
                        ],
                        'unit_amount' => $productDetails->price * 100, // Stripe expects amount in cents
                    ],
                    'quantity' => 1,
                ]],
                'mode' => 'payment',
                'success_url' => rtrim($baseUrl, '/') . '/mobile/purchase/success?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => rtrim($baseUrl, '/') . '/mobile/purchase/cancelled',
                'metadata' => [
                    'user_id' => (string) $user->id,
                    'product_id' => (string) $productDetails->id,
                    'credits' => (string) $productDetails->credits,
                ],
            ]);
            
            Log::info('Stripe checkout session created', [
                'user_id' => $user->id,
                'product_id' => $productDetails->id,
                'credits' => $productDetails->credits,
                'base_url' => $baseUrl,
                'success_url' => rtrim($baseUrl, '/') . '/mobile/purchase/success?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => rtrim($baseUrl, '/') . '/mobile/purchase/cancelled'
            ]);

            return response()->json([
                'success' => true,
                'checkout_url' => $checkout_session->url,
                'session_id' => $checkout_session->id,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create checkout session: ' . $e->getMessage()
            ], 500);
        }
    });
    
    // Note: Payment success/cancel routes moved to web.php for public access (no /api prefix needed)
});

