<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use App\Models\ContactedLeadsModel;
use Stripe\Stripe;
use Stripe\Checkout\Session;

use App\Http\Controllers\LeadsController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\CreditController;
use App\Http\Controllers\PurchaseController;
use App\Models\User;
use App\Models\StripeProductsModel;
use App\Models\CreditsTrailModel;
use App\Helpers\AuthHelper;
use App\Helpers\DateHelper;
use App\Helpers\ContactHelper;
use App\Helpers\RatingHelper;
use App\Helpers\CacheHelper;
use App\Helpers\ImageValidationHelper;
use App\Http\Requests\ApiLoginRequest;
use App\Http\Requests\CreateLeadRequest;
use App\Http\Requests\UpdateUserProfileRequest;
use App\Services\StructuredLogService;

/*
|--------------------------------------------------------------------------
| HELPER FUNCTIONS
|--------------------------------------------------------------------------
| Helper functions have been moved to dedicated Helper classes:
| - App\Helpers\AuthHelper::getAuthenticatedUser()
| - App\Helpers\DateHelper::timeAgo()
| - App\Helpers\ContactHelper::maskContactInfo()
| - App\Helpers\RatingHelper::calculateCustomerRating()
|
| For backward compatibility, global function wrappers are provided below.
| These can be removed in the future once all code uses the helper classes directly.
*/

// All helper functions are now in dedicated Helper classes - use them directly

/*
|--------------------------------------------------------------------------
| PUBLIC / LIGHTWEIGHT TEST ROUTES
|--------------------------------------------------------------------------
*/

// Include public routes from separate file
require __DIR__.'/api/public.php';

// simple health check for mobile
Route::get('/test-connection', function () {
    return response()->json([
        'status'    => 'success',
        'message'   => 'Mobile app can connect to Laravel API',
        'timestamp' => now()->toISOString(),
        'server'    => 'Laravel API Server'
    ]);
});

// count users (no auth) - MOVED TO routes/api/public.php
/*Route::get('/user-count', function () {
    return response()->json([
        'user_count' => User::count()
    ]);
});
*/

// get all services for registration screen (public) - MOVED TO routes/api/public.php
/*Route::get('/all-services', function () {
    try {
        // Use CacheHelper for better performance - services rarely change
        $services = \App\Helpers\CacheHelper::getServices();
        return response()->json([
            'success' => true,
            'data'    => $services
        ]);
    } catch (\Illuminate\Database\QueryException $dbError) {
        // Handle database connection errors
        if (str_contains($dbError->getMessage(), 'No connection could be made') || 
            str_contains($dbError->getMessage(), 'Connection refused')) {
            return response()->json([
                'success' => false,
                'message' => 'Database connection failed. Please ensure MySQL is running.',
                'error_type' => 'database_connection'
            ], 503); // Service Unavailable
        }
        return response()->json([
            'success' => false,
            'message' => 'Database error: ' . $dbError->getMessage()
        ], 500);
    } catch (\Throwable $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to load services: ' . $e->getMessage()
        ], 500);
    }
});
*/

// service-questions - MOVED TO routes/api/public.php
/*
Route::post('/service-questions', function (Request $request) {
    try {
        $service_id = (int)$request->service_id;
        $customerController = new CustomerController();
        $questions = \App\Models\ServiceQuestionModel::select('service_questions.service_id', 'service_questions.question', 'service_questions.id as question_id', 'service_possible_answers.service_answer','service_possible_answers.id')
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
            'success'  => true,
            'questions'=> $questions,
            'service_id'=> $service_id
        ], 200);
    } catch (\Throwable $e) {
        return response()->json([
            'success' => false,
            'message' => 'There is an error: ' . $e->getMessage()
        ], 500);
    }
});

/*
|--------------------------------------------------------------------------
| AUTH / REGISTRATION (mobile-first)
|--------------------------------------------------------------------------
*/

// Include auth routes from separate file
require __DIR__.'/api/auth.php';

// Include lead routes from separate file
require __DIR__.'/api/leads.php';

// Include user/profile routes from separate file
require __DIR__.'/api/users.php';

// Include payment routes from separate file
require __DIR__.'/api/payments.php';

// Include chat routes from separate file
require __DIR__.'/api/chat.php';

// Include notification routes from separate file
require __DIR__.'/api/notifications.php';

// Include rating routes from separate file
require __DIR__.'/api/ratings.php';

// Include mobile session routes from separate file
require __DIR__.'/api/mobile.php';

// Include search routes from separate file
require __DIR__.'/api/search.php';

// Include debug routes from separate file
require __DIR__.'/api/debug.php';

// test registration dummy
Route::post('/test-register', function (Request $request) {
    return response()->json([
        'status'  => 'success',
        'message' => 'Test registration successful',
        'data'    => $request->all()
    ]);
});

// multi-step register (real) - MOVED TO routes/api/auth.php
// Rate limited to 3 attempts per minute to prevent abuse
/*Route::post('/simple-register', function (Request $request) {
    try {
        $request->validate([
            'first_name'            => 'required|string|max:255',
            'last_name'             => 'required|string|max:255',
            'email'                 => 'required|string|email|max:255',
            'password'              => 'required|string|min:8',
            'password_confirmation' => 'required|string|min:8',
            'contact_number'        => 'required|string|max:20',
            'location'              => 'required|string|max:255',
            'latitude'              => 'required|string|max:20',
            'longitude'             => 'required|string|max:20',
            'distance'              => 'nullable|string|max:10',
            'company_name'          => 'nullable|string|max:255',
            'is_company_website'    => 'nullable|boolean',
            'company_size'          => 'nullable|string|max:50',
            'is_company_sales_team' => 'nullable|boolean',
            'is_company_social_media' => 'nullable|boolean',
            'role'                    => 'nullable|string|in:Customer,Expert,Provider,provider',
            'services'                => 'nullable|array',
            'biography'               => 'nullable|string|max:1000',
        ]);

        if ($request->password !== $request->password_confirmation) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Password confirmation does not match'
            ], 422);
        }

        $existingUser = User::where('email', $request->email)->first();
        if ($existingUser) {
            return response()->json([
                'status'  => 'duplicate',
                'message' => 'Account already exists, please sign in',
                'data'    => [
                    'user' => [
                        'id'             => $existingUser->id,
                        'first_name'     => $existingUser->first_name,
                        'last_name'      => $existingUser->last_name,
                        'email'          => $existingUser->email,
                        'role'           => $existingUser->role,
                        'contact_number' => $existingUser->contact_number,
                        'location'       => $existingUser->location,
                    ]
                ]
            ]);
        }

        try {
            error_log("Register - Received role: " . ($request->role ?? 'NULL'));
            error_log("Register - Full request: " . json_encode($request->all()));
            
            $user = User::create([
                'first_name'             => $request->first_name,
                'last_name'              => $request->last_name,
                'email'                  => $request->email,
                'password'               => Hash::make($request->password),
                'contact_number'         => $request->contact_number,
                'location'               => $request->location,
                'zip_code'               => $request->zip_code ?? null,
                'latitude'               => $request->latitude,
                'longitude'              => $request->longitude,
                'role'                   => $request->role ?? 'Expert',
                'distance'               => $request->distance ?? '0',
                'company_name'           => $request->company_name ?? '',
                'is_company_website'     => $request->is_company_website ?? 0,
                'company_size'           => $request->company_size ?? 'Self-employed',
                'is_company_sales_team'  => $request->is_company_sales_team ?? 0,
                'is_company_social_media'=> $request->is_company_social_media ?? 0,
                'biography'              => $request->biography ?? '',
                'entered_by'             => $request->email,
            ]);
            
            error_log("Register - User created with role: " . $user->role);
        } catch (\Throwable $e) {
            error_log("User creation error: " . $e->getMessage());
            return response()->json([
                'status'  => 'error',
                'message' => 'Failed to create user: ' . $e->getMessage()
            ], 500);
        }

        // attach up to 5 services
        if (($request->role === 'Expert' || $request->role === 'Provider' || $request->role === 'provider') && $request->services) {
            $servicesToAdd = array_slice($request->services, 0, 5);
            foreach ($servicesToAdd as $serviceId) {
                \App\Models\UserServicesModel::create([
                    'user_id'   => $user->id,
                    'service_id'=> (int)$serviceId,
                    'entered_by'=> $user->id,
                ]);
            }
        } elseif ($request->role === 'Expert' || $request->role === 'Provider' || $request->role === 'provider') {
            // default one
            \App\Models\UserServicesModel::create([
                'user_id'   => $user->id,
                'service_id'=> 1,
                'entered_by'=> $user->id,
            ]);
        }

        // create OTP
        $otp = rand(1000, 9999);
        \App\Models\Otp::create([
            'user_id'    => $user->id,
            'otp'        => $otp,
            'expires_at' => Carbon::now()->addMinutes(10),
        ]);

        // attempt to mail
        try {
            $user->notify(new \App\Notifications\SendOtpNotification($otp));
        } catch (\Throwable $e) {
            error_log("OTP for {$user->email}: {$otp}");
        }

        return response()->json([
            'status'  => 'success_otp',
            'message' => 'Registration successful! OTP sent to your email.',
            'data'    => [
                'user' => [
                    'id'                    => $user->id,
                    'first_name'            => $user->first_name,
                    'last_name'             => $user->last_name,
                    'email'                 => $user->email,
                    'role'                  => $user->role,
                    'contact_number'        => $user->contact_number,
                    'location'              => $user->location,
                    'latitude'              => $user->latitude,
                    'longitude'             => $user->longitude,
                    'distance'              => $user->distance,
                    'company_name'          => $user->company_name,
                    'is_company_website'    => $user->is_company_website,
                    'company_size'          => $user->company_size,
                    'is_company_sales_team' => $user->is_company_sales_team,
                    'is_company_social_media' => $user->is_company_social_media,
                    'biography'             => $user->biography,
                    'id_upload'             => $user->id_upload,
                    'self_upload'           => $user->self_upload,
                    'fica_verified'         => !empty($user->id_upload) && !empty($user->self_upload),
                ]
            ]
        ]);
    } catch (\Illuminate\Validation\ValidationException $e) {
        return response()->json([
            'status'  => 'error',
            'message' => 'Validation failed',
            'errors'  => $e->errors()
        ], 422);
    } catch (\Throwable $e) {
        error_log("Registration error: " . $e->getMessage());
        return response()->json([
            'status'  => 'error',
            'message' => 'Registration failed: ' . $e->getMessage()
        ], 500);
    }
});

// OTP verify (mobile)
Route::post('/verify-otp', function (Request $request) {
    try {
        $request->validate([
            'otp'     => 'required|digits:4',
            'user_id' => 'required|integer',
        ]);

        $otpRecord = \App\Models\Otp::where('user_id', $request->user_id)
            ->where('otp', $request->otp)
            ->where('is_used', false)
            ->where('expires_at', '>=', Carbon::now())
            ->first();

        if (!$otpRecord) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Invalid or expired OTP. Please try again.'
            ], 400);
        }

        $otpRecord->update(['is_used' => true]);

        $user = User::find($request->user_id);
        if (!$user) {
            return response()->json([
                'status'  => 'error',
                'message' => 'User not found'
            ], 404);
        }

        // If leadData is present, this is a customer flow. Coerce role to Customer before issuing token/response
        if ($request->has('leadData') && $user->role !== 'Customer') {
            try {
                $user->role = 'Customer';
                $user->save();
                // Refresh the user object to reflect the updated role
                $user = User::find($request->user_id);
            } catch (\Throwable $e) {
                error_log('Failed to set role to Customer during OTP: ' . $e->getMessage());
            }
        }

        // issue Sanctum token
        $token = $user->createToken('mobile-app')->plainTextToken;

        // Update the user's token in the database
        $user->update(['token' => $token]);

        // For customers, create lead after OTP verification
        if ($user->role === 'Customer' && $request->has('leadData')) {
            error_log('OTP Verification - Creating lead for Customer user_id: ' . $user->id);
            try {
                $leadData = $request->leadData;
                $service_id = (int)($leadData['service_id'] ?? 0);
                error_log('OTP Verification - service_id: ' . $service_id);
                
                if ($service_id > 0) {
                    $customer = new CustomerController();
                    $num_leads = $customer->getLeadsNumber($user->id);
                    
                    error_log('OTP Verification - num_leads: ' . $num_leads);
                    if ($num_leads < 2) { // Allow 2 leads per day for free customers
                        $description = $leadData['description'] ?? "N/A";
                        $estimate_quote = $leadData['estimate_quote'] ?? 0;
                        $urgent = $leadData['urgent'] ?? 0;
                        $hiring_decision = $leadData['hiring_decision'] ?? 0;
                        
                        error_log('OTP Verification - Creating lead with description: ' . $description);
                        $lead = $customer->createLead($user->id, $service_id, $user->id, $description, $estimate_quote, $urgent, $hiring_decision, $user->longitude, $user->latitude, $user->location);
                        error_log('OTP Verification - Lead created with ID: ' . $lead->id);
                        
                        // Save service question answers if provided
                        if (isset($leadData['questions']) && is_array($leadData['questions'])) {
                            $formData = [];
                            foreach ($leadData['questions'] as $questionId => $answer) {
                                $formData[] = [
                                    'name' => "x_{$questionId}",
                                    'value' => $answer
                                ];
                            }
                            if (!empty($formData)) {
                                $customer->addLeadService(json_encode($formData), $lead->id, $user->id);
                                error_log('OTP Verification - Added service questions for lead ID: ' . $lead->id);
                            }
                        }
                        
                        // Send notifications to nearby experts (using cache)
                        $services = CacheHelper::getServices();
                        $service = $services->where('id', $service_id)->first();
                        if ($service) {
                            $profile = new ProfileController();
                            $tokens = $profile->getUsersForNotifications($user->id, $service_id, $user->latitude, $user->longitude);
                            if (count($tokens) > 0) {
                                // Use unified notification service that handles both Expo and Firebase
                                \App\Services\ExpoPushNotification::sendNotificationToTokens(
                                    $tokens,
                                    "New Lead near you!!!",
                                    "You have received new lead for ".$service->service_name,
                                    "fortai://lead/{$lead->id}"
                                );
                                error_log('OTP Verification - Sent notifications to ' . count($tokens) . ' experts');
                                
                                // Create notification records in database for all experts
                                foreach ($tokens as $token) {
                                    try {
                                        $expertUser = User::where('token', $token)->first();
                                        if ($expertUser) {
                                            DB::table('notifications')->insert([
                                                'id' => \Illuminate\Support\Str::uuid(),
                                                'type' => 'App\Notifications\NewLeadNotification',
                                                'notifiable_type' => 'App\Models\User',
                                                'notifiable_id' => $expertUser->id,
                                                'data' => json_encode([
                                                    'title' => 'New Lead near you!!!',
                                                    'body' => 'You have received new lead for ' . $service->service_name,
                                                    'url' => "fortai://lead/{$lead->id}",
                                                    'type' => 'new_lead',
                                                    'lead_id' => $lead->id,
                                                    'service_name' => $service->service_name,
                                                ]),
                                                'read_at' => null,
                                                'created_at' => now(),
                                                'updated_at' => now(),
                                            ]);
                                        }
                                    } catch (\Throwable $e) {
                                        error_log('Failed to create notification record for expert: ' . $e->getMessage());
                                    }
                                }
                            }
                        }
                    } else {
                        error_log('OTP Verification - Lead limit reached, not creating lead');
                    }
                } else {
                    error_log('OTP Verification - Invalid service_id: ' . $service_id);
                }
            } catch (\Throwable $e) {
                error_log("Lead creation error during OTP verification: " . $e->getMessage());
                error_log("Lead creation stack trace: " . $e->getTraceAsString());
                // Continue even if lead creation fails
            }
        } else {
            error_log('OTP Verification - NOT creating lead. user->role: ' . $user->role . ', has leadData: ' . ($request->has('leadData') ? 'yes' : 'no'));
        }

        // Get user's services
        $userServices = \App\Models\UserServicesModel::where('user_id', $user->id)
            ->pluck('service_id')
            ->map(fn($id) => (int)$id)
            ->toArray();

        // Calculate rating based on role
        $rating = null;
        if ($user->role === 'Customer') {
            $rating = RatingHelper::calculateCustomerRating($user->id);
        } elseif ($user->role === 'Expert') {
            // Calculate expert rating from customer reviews
            $reviews = \App\Models\RatingsModel::where('to_user_id', $user->id)->get();
            $avgRating = $reviews->avg('rating');
            $rating = $avgRating ? round($avgRating, 1) : 0;
        }

        return response()->json([
            'status'  => 'success',
            'message' => 'OTP verified successfully. You are now logged in.',
            'data'    => [
                'user'  => [
                    'id'               => $user->id,
                    'first_name'       => $user->first_name,
                    'last_name'        => $user->last_name,
                    'email'            => $user->email,
                    'role'             => $user->role,
                    'contact_number'   => $user->contact_number,
                    'location'         => $user->location,
                    'zip_code'         => $user->zip_code,
                    'latitude'         => $user->latitude,
                    'longitude'        => $user->longitude,
                    'distance'         => $user->distance,
                    'company_name'     => $user->company_name,
                    'is_company_website'=> $user->is_company_website,
                    'company_size'     => $user->company_size,
                    'is_company_sales_team' => $user->is_company_sales_team,
                    'is_company_social_media'=> $user->is_company_social_media,
                    'biography'        => $user->biography,
                    'id_upload'        => $user->id_upload,
                    'self_upload'      => $user->self_upload,
                    'fica_verified'    => (bool)($user->fica_verified ?? false),
                    'verified_by'      => $user->verified_by,
                    'date_uploaded'    => $user->date_uploaded,
                    'date_verified'    => $user->date_verified,
                    'profile_picture'  => $user->profile_picture,
                    'services'         => $userServices,
                    'rating'           => $rating
                ],
                'token' => $token
            ]
        ]);
    } catch (\Illuminate\Validation\ValidationException $e) {
        return response()->json([
            'status'  => 'error',
            'message' => 'Validation failed',
            'errors'  => $e->errors()
        ], 422);
    } catch (\Throwable $e) {
        return response()->json([
            'status'  => 'error',
            'message' => 'OTP verification failed: ' . $e->getMessage()
        ], 500);
    }
})->middleware('throttle:3,1');*/ // MOVED TO routes/api/auth.php

// simple login (mobile) - MOVED TO routes/api/auth.php
// Rate limited to prevent brute force attacks (5 attempts per minute)
/*Route::post('/simple-login', function (ApiLoginRequest $request) {
    try {
        // Validation is handled by ApiLoginRequest Form Request class
        // Rate limiting: 5 attempts per minute to prevent brute force attacks

        try {
            $user = User::where('email', $request->email)->first();
        } catch (\Illuminate\Database\QueryException $dbError) {
            // Handle database connection errors
            if (str_contains($dbError->getMessage(), 'No connection could be made') || 
                str_contains($dbError->getMessage(), 'Connection refused')) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Database connection failed. Please ensure MySQL is running.',
                    'error_type' => 'database_connection'
                ], 503); // Service Unavailable
            }
            throw $dbError; // Re-throw if it's a different database error
        }
        if (!$user) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Account does not exist. Please register to create an account.'
            ], 404);
        }

        if (!Hash::check($request->password, $user->password)) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Invalid password'
            ], 401);
        }

        $token = $user->createToken('mobile-app')->plainTextToken;

        // Update the user's token in the database
        $user->update(['token' => $token]);

        // Get user's services
        $userServices = \App\Models\UserServicesModel::where('user_id', $user->id)
            ->pluck('service_id')
            ->map(fn($id) => (int)$id)
            ->toArray();

        // Calculate rating based on role
        $rating = null;
        if ($user->role === 'Customer') {
            $rating = RatingHelper::calculateCustomerRating($user->id);
        } elseif ($user->role === 'Expert') {
            // Calculate expert rating from customer reviews
            $reviews = \App\Models\RatingsModel::where('to_user_id', $user->id)->get();
            $avgRating = $reviews->avg('rating');
            $rating = $avgRating ? round($avgRating, 1) : 0;
        }

        return response()->json([
            'status'  => 'success',
            'message' => 'Login successful',
            'data'    => [
                'user'  => [
                    'id'               => $user->id,
                    'first_name'       => $user->first_name,
                    'last_name'        => $user->last_name,
                    'email'            => $user->email,
                    'role'             => $user->role,
                    'contact_number'   => $user->contact_number,
                    'location'         => $user->location,
                    'zip_code'         => $user->zip_code,
                    'latitude'         => $user->latitude,
                    'longitude'        => $user->longitude,
                    'distance'         => $user->distance,
                    'company_name'     => $user->company_name,
                    'is_company_website'=> $user->is_company_website,
                    'company_size'     => $user->company_size,
                    'is_company_sales_team' => $user->is_company_sales_team,
                    'is_company_social_media'=> $user->is_company_social_media,
                    'biography'        => $user->biography,
                    'id_upload'        => $user->id_upload,
                    'self_upload'      => $user->self_upload,
                    'fica_verified'    => (bool)($user->fica_verified ?? false),
                    'verified_by'      => $user->verified_by,
                    'date_uploaded'    => $user->date_uploaded,
                    'date_verified'    => $user->date_verified,
                    'profile_picture'  => $user->profile_picture,
                    'services'         => $userServices,
                    'rating'           => $rating
                ],
                'token' => $token
            ]
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'status'  => 'error',
            'message' => $e->getMessage()
        ], 500);
    }
});*/ // MOVED TO routes/api/auth.php

// public auth endpoints for SPA - MOVED TO routes/api/auth.php
// Route::prefix('auth')->group(function () {
//     Route::post('login', [AuthenticatedSessionController::class, 'store']);
//     Route::post('register', [RegisteredUserController::class, 'store']);
//     Route::post('verify-otp', [RegisteredUserController::class, 'verifyOtp']);
//     Route::post('resend-otp', [RegisteredUserController::class, 'resendOtp']);
//     Route::post('forgot-password', [PasswordResetLinkController::class, 'store']);
//     Route::post('reset-password', [NewPasswordController::class, 'store']);
// });

/*
|--------------------------------------------------------------------------
| LEAD CREATION (MOBILE) - REQUIRES AUTHENTICATION
|--------------------------------------------------------------------------
| Requires Sanctum authentication. All clients must use Sanctum tokens.
| MOVED TO routes/api/leads.php
*/
// Rate limited to prevent spam - 20 leads per minute
/*Route::post('/leads', function (CreateLeadRequest $request) {
    try {
        $user = $request->user();
        if (!$user) {
            StructuredLogService::logSecurity('unauthorized_lead_creation', [
                'endpoint' => '/leads',
                'ip_address' => $request->ip(),
            ]);
            return response()->json([
                'status'  => 'error',
                'message' => 'User not authenticated'
            ], 401);
        }

        StructuredLogService::logApiRequest($request, 'lead_creation', [
            'user_id' => $user->id,
            'role' => $user->role,
        ]);

        // Validation is handled by CreateLeadRequest Form Request class

        // Check daily lead limit for customers
        if ($user->role === 'Customer') {
            $customer = new CustomerController();
            $num_leads = $customer->getLeadsNumber($user->id);
            if ($num_leads >= 2) {
                return response()->json([
                    'status'  => 'leads_limit',
                    'message' => 'Daily leads limit reached! You can only create 2 leads per day.'
                ], 200);
            }
        }

        // Map category/service name to service_id (using cache)
        $serviceId = 1; // Default
        if ($request->has('category') && !empty($request->category)) {
            $service = CacheHelper::getServiceByName($request->category);
            if ($service) {
                $serviceId = $service->id;
            }
        }

        // Get credit range for this service and randomize credits (using cache)
        $services = CacheHelper::getServices();
        $serviceData = $services->where('id', $serviceId)->first();
        
        $credits = 1000; // Default
        $estimateQuote = (int) preg_replace('/\D/', '', $request->budget);
        
        if ($serviceData) {
            $minCredits = (int) ($serviceData->min_credits ?? 500);
            $maxCredits = (int) ($serviceData->max_credits ?? 2000);
            $credits = rand($minCredits, $maxCredits);
        }

        $lead = \App\Models\LeadsModel::create([
            'user_id'        => $user->id,
            'service_id'     => $serviceId,
            'credits'        => $credits,
            'entered_by'     => $user->id,
            'description'    => $request->description,
            'estimate_quote' => $estimateQuote,
            'hiring_decision'=> 0,
            'urgent'         => $request->urgency === 'Urgent' ? 1 : 0,
            'longitude'      => $user->longitude,
            'latitude'       => $user->latitude,
            'location'       => $request->location,
            'zipcode'        => $user->zip_code,
            'temp_code'      => 0,
        ]);
        
        // Update status and date_entered separately since they might not be fillable
        $lead->status = 'Open';
        $lead->date_entered = now();
        $lead->save();

        // Log successful lead creation
        StructuredLogService::logLead('created', $lead->id, $user->id, [
            'service_id' => $serviceId,
            'credits' => $credits,
            'urgency' => $request->urgency,
        ]);
        
        StructuredLogService::logApiResponse('lead_creation', 200, [
            'lead_id' => $lead->id,
        ]);

        // handle images with proper validation and security checks
        if ($request->has('images') && is_array($request->images)) {
            $maxImages = 10; // Limit number of images per lead
            $processedCount = 0;
            
            foreach ($request->images as $index => $imageData) {
                // Limit number of images
                if ($processedCount >= $maxImages) {
                    Log::warning('Image limit exceeded for lead', [
                        'lead_id' => $lead->id,
                        'user_id' => $user->id,
                        'attempted_images' => count($request->images)
                    ]);
                    break;
                }

                if (empty($imageData)) continue;

                // Validate and decode base64 image
                $validationResult = ImageValidationHelper::validateAndDecodeBase64($imageData);
                
                if (!$validationResult['success']) {
                    Log::warning('Image validation failed', [
                        'lead_id' => $lead->id,
                        'user_id' => $user->id,
                        'error' => $validationResult['error']
                    ]);
                    continue; // Skip invalid images
                }

                $binary = $validationResult['binary'];
                $extension = $validationResult['extension'] ?? 'jpg';
                $mimeType = $validationResult['mime'] ?? 'image/jpeg';

                // Generate secure filename
                $filename = ImageValidationHelper::generateSecureFilename('lead', $lead->id, $index, $extension);
                $relativePath = 'uploads/' . $filename;

                try {
                    // Store the validated image
                    Storage::disk('public')->put($relativePath, $binary);

                    \App\Models\ImagesModel::create([
                        'lead_id'     => $lead->id,
                        'user_id'     => $user->id,
                        'image_name'  => $filename,
                        'image_url'   => 'storage/' . $relativePath,
                        'entered_by'  => $user->id,
                        'date_entered'=> now(),
                    ]);
                    
                    $processedCount++;
                } catch (\Throwable $e) {
                    Log::error('Failed to store image', [
                        'lead_id' => $lead->id,
                        'user_id' => $user->id,
                        'filename' => $filename,
                        'error' => $e->getMessage()
                    ]);
                    // Continue processing other images even if one fails
                }
            }
        }

        // handle service details (questions and answers)
        if ($request->has('questionAnswers') && is_array($request->questionAnswers) && !empty($request->questionAnswers)) {
            $serviceDetailsArray = [];
            foreach ($request->questionAnswers as $questionId => $answer) {
                if (empty($answer)) continue;
                
                // Get the actual question text
                $questionRecord = \App\Models\ServiceQuestionModel::where('id', $questionId)->first();
                $questionText = $questionRecord ? $questionRecord->question : '';
                
                $serviceDetailsArray[] = [
                    'question_id' => (int)$questionId,
                    'answer'      => $answer,
                    'question'    => $questionText,
                ];
            }
            
            if (!empty($serviceDetailsArray)) {
                $serviceDetailsJson = json_encode($serviceDetailsArray);
                \App\Models\LeadsServiceModel::create([
                    'lead_id'         => $lead->id,
                    'service_details' => $serviceDetailsJson,
                    'entered_by'      => $user->id,
                ]);
            }
        }

        // Send notifications to nearby experts for this service (using cache)
        if ($serviceId > 0) {
            $services = CacheHelper::getServices();
            $service = $services->where('id', $serviceId)->first();
            if ($service) {
                try {
                    $profile = new ProfileController();
                    $tokens = $profile->getUsersForNotifications($user->id, $serviceId, $user->latitude, $user->longitude);
                    if (count($tokens) > 0) {
                        // Use unified notification service that handles both Expo and Firebase
                        \App\Services\ExpoPushNotification::sendNotificationToTokens(
                            $tokens,
                            "New Lead near you!!!",
                            "You have received new lead for ".$service->service_name,
                            "https://test.zbsburial.com/public/seller/dashboard"
                        );
                    }
                } catch (\Exception $e) {
                    error_log("Failed to send push notification: " . $e->getMessage());
                    // Don't fail the lead creation if notification fails
                }
            }
        }

        return response()->json([
            'status'  => 'success',
            'message' => 'Service request created successfully',
            'data'    => [
                'id'          => $lead->id,
                'description' => $lead->description,
                'location'    => $lead->location,
                'credits'     => $lead->credits,
                'urgent'      => $lead->urgent,
                'status'      => $lead->status,
                'created_at'  => $lead->date_entered,
            ]
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'status'  => 'error',
            'message' => $e->getMessage()
        ], 500);
    }
})->middleware('auth:sanctum');*/ // MOVED TO routes/api/leads.php

/*
|--------------------------------------------------------------------------
| DASHBOARD (MOBILE) - REAL DATA, NO MOCKS
|--------------------------------------------------------------------------
| MOVED TO routes/api/users.php
*/
/*Route::get('/dashboard', function (Request $request) {
    try {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'User not authenticated'
            ], 401);
        }

        if ($user) {
            $profileController = new ProfileController();

            if ($user->role === 'Expert' || $user->role === 'Provider') {
                $availableLeads = $profileController->getLeadsCount($user);
                $unreadLeads    = \App\Models\LeadsModel::join('user_services as u', 'leads.service_id', '=', 'u.service_id')
                    ->where('u.user_id', $user->id)
                    ->where('leads.status', '=', 'Open')
                    ->whereNotIn('leads.id', function ($query) use ($user) {
                        $query->select('lead_id')
                            ->from('contacted_lead')
                            ->where('user_id', $user->id);
                    })
                    ->count();
            } else {
                $availableLeads = \App\Models\LeadsModel::where('user_id', $user->id)->count();
                $unreadLeads    = 0;
            }

            // For customers, count how many providers responded to their leads
            // For providers, count how many leads they responded to
            if ($user->role === 'Customer') {
                // Count all providers who responded to any of the customer's leads
                $myResponses = \App\Models\ContactedLeadsModel::join('leads', 'contacted_lead.lead_id', '=', 'leads.id')
                    ->where('leads.user_id', $user->id)
                    ->count();
                $completedJobs = \App\Models\LeadsModel::where('user_id', $user->id)
                    ->whereIn('status', ['Closed', 'Bought', 'Unavailable'])
                    ->count();
            } else {
                $myResponses   = $profileController->getResponseLeadsCount($user->id);
                $completedJobs = $profileController->getResponseLeadsCount($user->id, 2);
            }

            // Always pull latest values (credits, etc.) from DB
            $user->refresh();
            // In case refresh didn't hit a new instance, fetch fresh credits explicitly
            $freshCredits = (float) \App\Models\User::where('id', $user->id)->value('credits_balance');

            $dashboardData = [
                'leads'         => $availableLeads,
                'unreadLeads'   => $unreadLeads,
                'responses'     => $myResponses,
                'completedJobs' => $completedJobs,
                'credits'       => $freshCredits,
                'user'          => [
                    'id'              => $user->id,
                    'name'            => $user->first_name ?? $user->name,
                    'email'           => $user->email,
                    'role'            => $user->role ?? 'Customer',
                    'profile_picture' => $user->profile_picture ?? null,
                    'services_count'  => (int) \App\Models\UserServicesModel::where('user_id', $user->id)->count(),
                    'fica_verified'   => !empty($user->id_upload) && !empty($user->self_upload)
                ]
            ];
        } else {
            // unauthenticated fallback
            $totalLeads     = \App\Models\LeadsModel::count();
            $totalResponses = \App\Models\ResponsesModel::count();
            $completedJobs  = \App\Models\ResponsesModel::where('status', 'completed')->count();

            $dashboardData = [
                'leads'         => $totalLeads,
                'unreadLeads'   => 0,
                'responses'     => $totalResponses,
                'completedJobs' => $completedJobs,
                'credits'       => 0,
                'user'          => null
            ];
        }

        return response()->json([
            'status'  => 'success',
            'message' => 'Dashboard data retrieved successfully',
            'data'    => $dashboardData
        ]);

    } catch (\Throwable $e) {
        return response()->json([
            'status'  => 'error',
            'message' => $e->getMessage()
        ], 500);
    }
})->middleware('auth:sanctum');*/ // MOVED TO routes/api/users.php

/*
|--------------------------------------------------------------------------
| PROFILE (single endpoint for mobile)
|--------------------------------------------------------------------------
| MOVED TO routes/api/users.php
*/
/*Route::get('/user/profile', function (Request $request) {
    try {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated'
            ], 401);
        }

        // Re-fetch user from database to get absolutely fresh data
        $user = User::find($user->id);

        // Get user's services
        $profileController = new ProfileController();
        $userServices = \App\Models\UserServicesModel::where('user_id', $user->id)
            ->pluck('service_id')
            ->map(fn($id) => (int)$id)
            ->toArray();

        // Calculate rating based on role
        $rating = null;
        if ($user->role === 'Customer') {
            $rating = RatingHelper::calculateCustomerRating($user->id);
        } elseif ($user->role === 'Expert') {
            // Calculate expert rating from customer reviews
            $reviews = \App\Models\RatingsModel::where('to_user_id', $user->id)->get();
            $avgRating = $reviews->avg('rating');
            $rating = $avgRating ? round($avgRating, 1) : 0;
        }
        
        // Build response data
        $responseData = [
            'id'                    => $user->id,
            'first_name'            => $user->first_name,
            'last_name'             => $user->last_name,
            'email'                 => $user->email,
            'role'                  => $user->role,
            'contact_number'        => $user->contact_number,
            'location'              => $user->location,
            'zip_code'              => $user->zip_code,
            'latitude'              => $user->latitude,
            'longitude'             => $user->longitude,
            'distance'              => $user->distance,
            'company_name'          => $user->company_name,
            'is_company_website'    => $user->is_company_website,
            'company_size'          => $user->company_size,
            'is_company_sales_team' => $user->is_company_sales_team,
            'is_company_social_media'=> $user->is_company_social_media,
            'biography'             => $user->biography,
            'id_upload'             => $user->id_upload,
            'self_upload'           => $user->self_upload,
            'fica_verified'         => !empty($user->id_upload) && !empty($user->self_upload),
            'credits_balance'       => $user->credits_balance ?? 0,
            'profile_picture'       => $user->profile_picture,
            'services'              => $userServices,
            'created_at'            => $user->created_at,
            'updated_at'            => $user->updated_at,
            'rating'                => $rating
        ];

        return response()->json([
            'success' => true,
            'data' => $responseData
        ]);

    } catch (\Throwable $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to get user profile: ' . $e->getMessage()
        ], 500);
    }
})->middleware('auth:sanctum');*/ // MOVED TO routes/api/users.php

/*
|--------------------------------------------------------------------------
| USER LOCATION UPDATE (mobile)
|--------------------------------------------------------------------------
| MOVED TO routes/api/users.php
*/
/*Route::post('/user/location', function (Request $request) {
    try {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated'
            ], 401);
        }

        $request->validate([
            'address'   => 'required|string|max:255',
            'latitude'  => 'required|string|max:20',
            'longitude' => 'required|string|max:20',
            'distance'  => 'nullable|string|in:10,20,50,0',
        ]);

        $user->update([
            'location'  => $request->address,
            'latitude'  => $request->latitude,
            'longitude' => $request->longitude,
            'distance'  => $request->distance ?? $user->distance,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Location updated successfully',
            'data'    => [
                'location'  => $user->location,
                'latitude'  => $user->latitude,
                'longitude' => $user->longitude,
                'distance'  => $user->distance,
            ]
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to update location: ' . $e->getMessage()
        ], 500);
    }
})->middleware('auth:sanctum');*/ // MOVED TO routes/api/users.php

/*
|--------------------------------------------------------------------------
| USER SERVICES UPDATE (mobile)
|--------------------------------------------------------------------------
| MOVED TO routes/api/users.php
*/
/*Route::post('/user/services', function (Request $request) {
    try {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated'
            ], 401);
        }

        $request->validate([
            'services' => 'required|array',
            'services.*' => 'required|integer',
        ]);

        // Delete existing services
        \App\Models\UserServicesModel::where('user_id', $user->id)->delete();

        // Add new services (up to 5)
        $servicesToAdd = array_slice($request->services, 0, 5);
        foreach ($servicesToAdd as $serviceId) {
            \App\Models\UserServicesModel::create([
                'user_id'   => $user->id,
                'service_id' => (int)$serviceId,
                'entered_by' => $user->id,
            ]);
        }

        // Get updated services
        $userServices = \App\Models\UserServicesModel::where('user_id', $user->id)
            ->pluck('service_id')
            ->map(fn($id) => (int)$id)
            ->toArray();

        return response()->json([
            'success' => true,
            'message' => 'Services updated successfully',
            'data'    => [
                'services' => $userServices
            ]
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to update services: ' . $e->getMessage()
        ], 500);
    }
})->middleware('auth:sanctum');*/ // MOVED TO routes/api/users.php
/*
|--------------------------------------------------------------------------
| USER AVATAR UPLOAD (mobile)
|--------------------------------------------------------------------------
| MOVED TO routes/api/users.php
*/
/*Route::post('/user/avatar', function (Request $request) {
    try {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated'
            ], 401);
        }

        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        // Store uploaded avatar
        try {
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error("Failed to store avatar", [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
        
        // Get base URL
        $baseUrl = $request->getSchemeAndHttpHost();
        $avatarUrl = $baseUrl . '/storage/' . $avatarPath;

        // Update user's profile picture
        try {
            $user->update([
                'profile_picture' => $avatarUrl,
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error("Failed to update profile picture", [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
            // Delete the uploaded file if database update fails
            Storage::disk('public')->delete($avatarPath);
            throw $e;
        }

        return response()->json([
            'success' => true,
            'message' => 'Profile picture updated successfully',
            'data' => [
                'profile_picture' => $avatarUrl
            ]
        ]);
    } catch (\Illuminate\Validation\ValidationException $e) {
        return response()->json([
            'success' => false,
            'message' => 'Validation failed',
            'errors' => $e->errors()
        ], 422);
    } catch (\Throwable $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to upload avatar: ' . $e->getMessage()
        ], 500);
    }
})->middleware('auth:sanctum');*/ // MOVED TO routes/api/users.php

/*
|--------------------------------------------------------------------------
| Change Password (mobile)
|--------------------------------------------------------------------------
| MOVED TO routes/api/users.php
*/
/*Route::put('/user/password', function (Request $request) {
    try {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated'
            ], 401);
        }

        $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        // Verify current password
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password is incorrect'
            ], 422);
        }

        // Update password
        $user->password = Hash::make($request->password);
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Password updated successfully'
        ]);
    } catch (\Illuminate\Validation\ValidationException $e) {
        return response()->json([
            'success' => false,
            'message' => 'Validation failed',
            'errors' => $e->errors()
        ], 422);
    } catch (\Throwable $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to update password: ' . $e->getMessage()
        ], 500);
    }
})->middleware('auth:sanctum');*/ // MOVED TO routes/api/users.php


/*
|--------------------------------------------------------------------------
| FICA upload (mobile) - use helper auth
|--------------------------------------------------------------------------
| MOVED TO routes/api/users.php
*/
/*Route::post('/verify-fica', function (Request $request) {
    try {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'status'  => 'error',
                'message' => 'User not authenticated'
            ], 401);
        }


        $request->validate([
            'idUpload'    => 'required|file|mimes:jpeg,png,jpg,pdf|max:4048',
            'selfieUpload'=> 'required|image|mimes:jpeg,png,jpg|max:4048',
        ]);

        if (!$request->hasFile('idUpload') || !$request->hasFile('selfieUpload')) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Both ID/Passport and Selfie are required!'
            ], 422);
        }

        $idPath     = $request->file('idUpload')->store('uploads/ids', 'public');
        $selfiePath = $request->file('selfieUpload')->store('uploads/selfies', 'public');

        $user->update([
            'id_upload'     => basename($idPath),
            'self_upload'   => basename($selfiePath),
            'date_uploaded' => now(),
            'fica_verified' => false,
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'FICA documents uploaded successfully! Please wait for admin verification. You will be able to view leads once verified.',
            'data'    => [
                'user' => [
                    'id'             => $user->id,
                    'first_name'     => $user->first_name,
                    'last_name'      => $user->last_name,
                    'email'          => $user->email,
                    'role'           => $user->role,
                    'contact_number' => $user->contact_number,
                    'location'       => $user->location,
                    'latitude'       => $user->latitude,
                    'longitude'      => $user->longitude,
                    'distance'       => $user->distance,
                    'company_name'   => $user->company_name,
                    'is_company_website' => $user->is_company_website,
                    'company_size'   => $user->company_size,
                    'is_company_sales_team' => $user->is_company_sales_team,
                    'is_company_social_media'=> $user->is_company_social_media,
                    'id_upload'      => $user->id_upload,
                    'self_upload'    => $user->self_upload,
                    'fica_verified'  => false
                ]
            ]
        ]);
    } catch (\Illuminate\Validation\ValidationException $e) {
        return response()->json([
            'status'  => 'error',
            'message' => 'Validation failed: ' . implode(', ', array_map(function ($errors) {
                return is_array($errors) ? $errors[0] : $errors;
            }, array_values($e->errors()))),
            'errors'  => $e->errors()
        ], 422);
    } catch (\Throwable $e) {
        return response()->json([
            'status'  => 'error',
            'message' => 'FICA verification failed: ' . $e->getMessage()
        ], 500);
    }
})->middleware('auth:sanctum');*/ // MOVED TO routes/api/users.php

/*
|--------------------------------------------------------------------------
| PROTECTED ROUTES (Sanctum)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    // user profile full (web) - MOVED TO routes/api/users.php
    /*Route::prefix('user')->group(function () {
        Route::get('profile', [ProfileController::class, 'getProfile']);
        Route::put('profile', [ProfileController::class, 'updateProfile']);
        Route::put('change-password', [PasswordController::class, 'update']);
    });*/ // MOVED TO routes/api/users.php

    // Leads (web) - MOVED TO routes/api/leads.php
    /*Route::prefix('leads')->group(function () {
        Route::get('/', [LeadsController::class, 'getUserLeads']);
        Route::get('my', [CustomerController::class, 'getMyLeads']);
        Route::get('available', [LeadsController::class, 'getAvailableLeads']);
        Route::get('{id}', [LeadsController::class, 'getLeadDetails']);
        // Remove createLead route as it's not designed for direct routing
        // use the /leads endpoint defined earlier at line 673
        Route::put('{id}', [LeadsController::class, 'updateLead']);
        Route::delete('{id}', [LeadsController::class, 'deleteLead']);
        Route::post('{id}/contact', [LeadsController::class, 'contactLead']);
    });*/ // MOVED TO routes/api/leads.php

    // services (web)
    Route::prefix('services')->group(function () {
        Route::get('/', [LeadsController::class, 'getServices']);
        Route::get('my', [ProfileController::class, 'getMyServices']);
        Route::get('{id}', [LeadsController::class, 'getServiceDetails']);
        Route::post('/', [ProfileController::class, 'createService']);
        Route::put('{id}', [ProfileController::class, 'updateService']);
        Route::delete('{id}', [ProfileController::class, 'deleteService']);
        Route::get('{id}/questions', [CustomerController::class, 'getServicesQuestions']);
    });

    // messages / chat - MOVED TO routes/api/chat.php
    /*Route::prefix('messages')->group(function () {
        Route::get('conversations', [LeadsController::class, 'getConversations']);
        Route::get('{conversationId}', [LeadsController::class, 'getMessages']);
        Route::post('/', [LeadsController::class, 'sendMessage']);
        Route::put('{conversationId}/read', [LeadsController::class, 'markAsRead']);
    });*/ // MOVED TO routes/api/chat.php

    // notifications - MOVED TO routes/api/notifications.php
    /*Route::prefix('notifications')->group(function () {
        Route::get('/', [ProfileController::class, 'getNotifications']);
        Route::put('{id}/read', [ProfileController::class, 'markNotificationAsRead']);
        Route::put('read-all', [ProfileController::class, 'markAllAsRead']);
        Route::delete('clear-all', [ProfileController::class, 'clearAllNotifications']);
        Route::get('unread-count', [ProfileController::class, 'getUnreadCount']);
        Route::post('register-token', [ProfileController::class, 'registerPushToken']);
    });*/ // MOVED TO routes/api/notifications.php

    // payments & credits - MOVED TO routes/api/payments.php
    /*Route::prefix('payments')->group(function () {
        Route::post('purchase-credits', [PurchaseController::class, 'purchase']);
        Route::get('transactions', [ProfileController::class, 'transactionHistory']);
        Route::get('methods', [ProfileController::class, 'getPaymentMethods']);
        Route::post('methods', [ProfileController::class, 'addPaymentMethod']);
    });*/ // MOVED TO routes/api/payments.php

    // Credits history endpoint - MOVED TO routes/api/payments.php
    /*Route::get('/credits-history/{userId}', function (Request $request, $userId) {
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
    });*/ // MOVED TO routes/api/payments.php

    // Get available credit packages - MOVED TO routes/api/payments.php
    /*Route::get('/mobile/packages', function (Request $request) {
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
    });*/ // MOVED TO routes/api/payments.php

    // Mobile Stripe Checkout - MOVED TO routes/api/payments.php
    /*Route::post('/mobile/create-checkout-session', function (Request $request) {
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
    });*/ // MOVED TO routes/api/payments.php
    
    // Note: Payment success/cancel routes moved to web.php for public access (no /api prefix needed)

    // ratings - MOVED TO routes/api/ratings.php
    /*Route::prefix('ratings')->group(function () {
        Route::get('{userId}', [CustomerController::class, 'getRatings']);
        Route::post('/', [CustomerController::class, 'insertRatings']); // create
        Route::put('{id}', [CustomerController::class, 'updateRating']);
    });*/ // MOVED TO routes/api/ratings.php

    // location (web)
    Route::prefix('location')->group(function () {
        Route::get('nearby-services', [LeadsController::class, 'getNearbyServices']);
        Route::post('update', [ProfileController::class, 'updateLocation']);
    });

    // files
    Route::prefix('files')->group(function () {
        Route::post('upload-image', [ProfileController::class, 'uploadPhotos']);
        Route::post('upload-document', [ProfileController::class, 'uploadDocument']);
        Route::delete('{fileId}', [ProfileController::class, 'deleteFile']);
    });

    // logout for SPA
    Route::post('auth/logout', [AuthenticatedSessionController::class, 'destroy']);
});

/*
|--------------------------------------------------------------------------
| MOBILE: AVAILABLE LEADS (same logic as desktop)
|--------------------------------------------------------------------------
| MOVED TO routes/api/leads.php
*/
/*Route::middleware('auth:sanctum')->get('/available-leads', function (Request $request) {
    try {
        $user = $request->user();

        $page        = (int) $request->input('page', 1);
        $perPage     = 10;
        $offset      = ($page - 1) * $perPage;
        $filter      = (int) $request->input('filter', 0);
        $sortdistance= (int) $request->input('sortdistance', 0);

        $profileController = new ProfileController();
        $leads             = $profileController->getLeads($user, $page, $perPage, $offset, $filter, $sortdistance);
        $befirst_count     = $profileController->getLeadsCount($user, 1);
        $urgent_count      = $profileController->getLeadsCount($user, 2);

        $leadsController   = new LeadsController();
        $leadsArr          = $leadsController->arrLeads($leads['data']);

        return response()->json([
            'status'  => 'success',
            'message' => 'Leads retrieved successfully',
            'data'    => [
                'leads'        => $leadsArr,
                'leads_count'  => $leads['total'],
                'current_page' => $leads['current_page'],
                'last_page'    => $leads['last_page'],
                'befirst_count'=> $befirst_count,
                'urgent_count' => $urgent_count
            ]
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'status'  => 'error',
            'message' => $e->getMessage()
        ], 500);
    }
});*/ // MOVED TO routes/api/leads.php

/*
|--------------------------------------------------------------------------
| MOBILE: USER RESPONSES (for your React Native screen)
|--------------------------------------------------------------------------
| MOVED TO routes/api/leads.php
*/
/*Route::middleware('auth:sanctum')->get('/user-responses', function (Request $request) {
    try {
        $user = $request->user();
        $userId = $user->id;

        $page    = (int) $request->input('page', 1);
        $perPage = (int) $request->input('perPage', 10);
        $offset  = ($page - 1) * $perPage;
        $filter  = (int) $request->input('filter', 0);

        $profileController = new ProfileController();
        $leads             = $profileController->getResponseLeads($userId, $page, $perPage, $offset, $filter);
        $pending_count     = $profileController->getResponseLeadsCount($userId, 1);
        $hired_count       = $profileController->getResponseLeadsCount($userId, 2);

        $leadsController   = new LeadsController();
        $leadsArr          = $leadsController->arrLeads($leads['data'], 1, $userId);

        return response()->json([
            'message' => 'Successful',
            'leads'   => [
                'leadsArr'     => $leadsArr,
                'leads_count'  => $leads['total'],
                'pending_count'=> $pending_count,
                'hired_count'  => $hired_count,
                'current_page' => (int) $leads['current_page'],
                'last_page'    => $leads['last_page'],
                'filter'       => $filter
            ]
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'status'  => 'error',
            'message' => $e->getMessage()
        ], 500);
    }
});*/ // MOVED TO routes/api/leads.php

/*
|--------------------------------------------------------------------------
| UPDATE CONTACTED LEAD STATUS (mobile)
|--------------------------------------------------------------------------
| MOVED TO routes/api/leads.php
*/
/*Route::post('/update-contact-status', function (Request $request) {
    try {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'status'  => 'error',
                'message' => 'User not authenticated'
            ], 401);
        }

        $request->validate([
            'lead_id' => 'required|integer|exists:leads,id',
            'status'  => 'required|string|in:Pending,Hired,Not Interested'
        ]);

        $leadId = (int) $request->lead_id;
        $status = $request->status;

        $contactedLead = \App\Models\ContactedLeadsModel::where('lead_id', $leadId)
            ->where('user_id', $user->id)
            ->first();

        if (!$contactedLead) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Contacted lead not found'
            ], 404);
        }

        $contactedLead->status = $status;
        $contactedLead->save();

        return response()->json([
            'status'  => 'success',
            'message' => 'Status updated successfully',
            'data'    => [
                'lead_id' => $leadId,
                'status'  => $status
            ]
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'status'  => 'error',
            'message' => $e->getMessage()
        ], 500);
    }
})->middleware('auth:sanctum');*/ // MOVED TO routes/api/leads.php

/*
|--------------------------------------------------------------------------
| MOBILE: USER REQUESTS (customer's own leads)
|--------------------------------------------------------------------------
| MOVED TO routes/api/leads.php
*/
/*Route::get('/user-requests', function (Request $request) {
    try {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'status'  => 'error',
                'message' => 'User not authenticated'
            ], 401);
        }

        $page    = (int) $request->input('page', 1);
        $perPage = 10;
        $offset  = ($page - 1) * $perPage;
        
        // Check if we should filter out completed/closed requests (for dashboard)
        $activeOnly = $request->input('active_only', false);

        $query = \App\Models\LeadsModel::select(
                'leads.id',
                'leads.service_id',
                'leads.description',
                'leads.location',
                'leads.credits',
                'leads.estimate_quote',
                'leads.urgent',
                'leads.date_entered',
                'leads.status',
                'master_services.service_name'
            )
            ->join('master_services', 'leads.service_id', '=', 'master_services.id')
            ->where('leads.user_id', $user->id);
            
        // Filter out completed/closed requests if active_only is true
        if ($activeOnly) {
            $query->whereNotIn('leads.status', ['Closed', 'Bought', 'Unavailable']);
        }
        
        $leads = $query
            ->orderBy('leads.id', 'desc')
            ->skip($offset)
            ->take($perPage)
            ->get();

        $transformed = $leads->map(function ($lead) {
            // Count how many providers responded to this lead
            $responseCount = \App\Models\ContactedLeadsModel::where('lead_id', $lead->id)->count();
            
            // Determine display status based on responses
            $displayStatus = 'pending';
            if ($lead->status === 'Closed' || $lead->status === 'Bought' || $lead->status === 'Unavailable') {
                $displayStatus = 'completed';
            } elseif ($responseCount > 0) {
                $displayStatus = 'in_progress';
            }
            
            return [
                'id'           => $lead->id,
                'title'        => $lead->service_name ?? 'Service Request',
                'description'  => $lead->description,
                'category'     => $lead->service_name ?? 'General Services',
                'budget'       => $lead->estimate_quote ? '$' . number_format($lead->estimate_quote, 2) : 'Budget not set',
                'location'     => $lead->location,
                'urgency'      => $lead->urgent ? 'Urgent' : 'Normal',
                'date'         => Carbon::parse($lead->date_entered)->diffForHumans(),
                'status'       => $displayStatus,
                'responseCount'=> $responseCount,
                'statusMessage'=> $displayStatus === 'pending'
                    ? "Waiting for experts to respond"
                    : ($displayStatus === 'in_progress' 
                        ? "{$responseCount} expert(s) responded"
                        : "Request completed")
            ];
        });

        return response()->json([
            'status'  => 'success',
            'message' => 'User requests retrieved successfully',
            'data'    => $transformed
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'status'  => 'error',
            'message' => $e->getMessage()
        ], 500);
    }
})->middleware('auth:sanctum');*/ // MOVED TO routes/api/leads.php

/*
|--------------------------------------------------------------------------
| LEAD DETAILS (mobile) – unified auth
|--------------------------------------------------------------------------
| MOVED TO routes/api/leads.php
*/
/*Route::get('/lead-details/{id}', function (Request $request, $id) {
    try {
        // Sanctum authenticates before hitting here; just use request user
        $user = $request->user();

        $profileController = new ProfileController();
        $lead = $profileController->getIndividualLead($id);

        if (!$lead) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Lead not found'
            ], 404);
        }

        $leadsController = new LeadsController();

        $contacted = $leadsController->userResponse($id);
        $leadAge     = time() - strtotime($lead->date_entered);
        if ($leadAge < 300) {
            $contacted = 0;
        }
        $contacted  = max(0, min(5, $contacted));
        $remender   = 5 - $contacted;
        $frequent   = $leadsController->frequentUser($lead->lead_user_id);
        $leadImages = $leadsController->getImages($id);
        $serviceDetails = $leadsController->getLeadServiceDetails($id);

        // did this provider unlock or respond? (using Eloquent models)
        $hasUnlocked = \App\Models\LeadUnlockModel::where('lead_id', $id)
            ->where('provider_id', $user->id)
            ->exists();

        // Use ContactedLeadsModel instead of DB::table
        $contactedLead = \App\Models\ContactedLeadsModel::where('lead_id', $id)
            ->where('user_id', $user->id)
            ->first();

        $hasResponded = $contactedLead !== null;

        $shouldShowUnhashed = $hasUnlocked || $hasResponded;
        
        // Calculate contacted_time if this provider has responded
        $contactedTime = null;
        $contactedDateTime = null;
        if ($contactedLead && $contactedLead->date_entered) {
            $contactedTime = DateHelper::timeAgo($contactedLead->date_entered);
            $contactedDateTime = $contactedLead->date_entered;
        }

        $images = $leadImages->map(function ($image) {
            // Use image_url if available, otherwise construct from image_name (for desktop-compatible images)
            $url = $image->image_url;
            
            if (empty($url)) {
                // Construct URL from image_name like desktop does
                $url = Storage::url('uploads/' . $image->image_name);
            }

            if (strpos($url, 'http') === 0) {
                $fullUrl = $url;
            } else {
                $fullUrl = URL::to($url);
            }

            return [
                'id'          => $image->id,
                'image_url'   => $fullUrl,
                'lead_id'     => $image->lead_id,
                'date_entered'=> $image->date_entered,
            ];
        });

        // Count total responses to this lead
        $responseCount = \App\Models\ContactedLeadsModel::where('lead_id', $id)->count();
        
        $leadData = [
            'id'         => $lead->id,
            'title'      => $lead->service_name,
            'description'=> $lead->description ?: 'No description provided',
            'location'   => $lead->location,
            'service_name' => $lead->service_name,
            'credits'    => $lead->credits,
            'budget'     => $lead->budget ?? $lead->service_price ?? null,
            'urgent'     => (bool) $lead->urgent,
            'is_phone_verified' => (bool) $lead->is_phone_verified,
            'hiring_decision'   => (int) $lead->hiring_decision,
            'date_entered'      => $lead->date_entered,
            'time_ago'          => DateHelper::timeAgo($lead->date_entered),
            'posted_datetime'   => $lead->date_entered ? date('Y-m-d H:i:s', strtotime($lead->date_entered)) : null,
            'contacted_time'    => $contactedTime,
            'contacted_datetime'=> $contactedDateTime ? date('Y-m-d H:i:s', strtotime($contactedDateTime)) : null,
            'contacted'         => $contacted,
            'remender'          => $remender,
            'frequent'          => $frequent,
            'is_contacted_by_user' => $hasResponded,
            'response_count'    => $responseCount,
            'customer'          => [
                'id'             => $lead->lead_user_id,
                'first_name'     => $lead->first_name,
                'last_name'      => $lead->last_name,
                'email'          => $shouldShowUnhashed ? $lead->email : ContactHelper::maskContactInfo($lead->email, 'email'),
                'contact_number' => $shouldShowUnhashed ? $lead->contact_number : ContactHelper::maskContactInfo($lead->contact_number, 'phone'),
                'first_letter'   => substr($lead->first_name, 0, 1),
                'is_unlocked'    => $shouldShowUnhashed,
            ],
            'images'         => $images,
            'service_details'=> $serviceDetails
        ];

        return response()->json([
            'status'  => 'success',
            'message' => 'Lead details retrieved successfully',
            'data'    => $leadData
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'status'  => 'error',
            'message' => $e->getMessage()
        ], 500);
    }
})->middleware('auth:sanctum');*/ // MOVED TO routes/api/leads.php

/*
|--------------------------------------------------------------------------
| GET CUSTOMER CONVERSATIONS GROUPED BY REQUEST (mobile)
|--------------------------------------------------------------------------
| MOVED TO routes/api/leads.php
*/
/*Route::get('/customer-conversations', function (Request $request) {
    try {
        $user = $request->user();
        if (!$user || $user->role !== 'Customer') {
            return response()->json([
                'status'  => 'error',
                'message' => 'Unauthorized'
            ], 401);
        }

        // Get all leads for this customer with eager loaded service to avoid N+1 queries
        $customerLeads = \App\Models\LeadsModel::where('user_id', $user->id)
            ->with('service') // Eager load service to prevent N+1 queries
            ->get(['id', 'service_id']);
        
        $conversations = [];
        
        foreach ($customerLeads as $lead) {
            // Get all providers who contacted this lead
            $providers = \App\Models\ContactedLeadsModel::where('lead_id', $lead->id)
                ->join('users', 'contacted_lead.user_id', '=', 'users.id')
                ->select(
                    'users.id as provider_id',
                    'users.first_name',
                    'users.last_name',
                    'users.profile_picture',
                    'contacted_lead.id as contact_id',
                    'contacted_lead.date_entered'
                )
                ->orderBy('contacted_lead.id', 'desc')
                ->get();
            
            foreach ($providers as $provider) {
                // Get the last note in this conversation
                $comm_link = ($user->id < $provider->provider_id) 
                    ? $user->id . '_' . $provider->provider_id 
                    : $provider->provider_id . '_' . $user->id;
                $comm_link_reverse = ($user->id < $provider->provider_id) 
                    ? $provider->provider_id . '_' . $user->id 
                    : $user->id . '_' . $provider->provider_id;
                
                $lastNote = \App\Models\LeadsNotesModel::where('lead_id', $lead->id)
                    ->where(function($query) use ($comm_link, $comm_link_reverse) {
                        $query->where('comm_link', $comm_link)
                              ->orWhere('comm_link', $comm_link_reverse);
                    })
                    ->orderBy('date_entered', 'desc')
                    ->first();
                
                // Get service name from eager loaded relationship (no additional query)
                $serviceName = $lead->service ? $lead->service->service_name : 'Service';
                
                // Count unread messages
                $unreadCount = 0;
                
                // Get actual datetime for sorting (use last note date or contacted date as fallback)
                $sortDateTime = null;
                if ($lastNote && $lastNote->date_entered) {
                    $sortDateTime = $lastNote->date_entered;
                } elseif ($provider->date_entered) {
                    $sortDateTime = $provider->date_entered;
                }
                
                $conversations[] = [
                    'lead_id'          => $lead->id,
                    'service_name'     => $serviceName,
                    'provider_id'      => $provider->provider_id,
                    'provider_name'    => $provider->first_name . ' ' . $provider->last_name,
                    'provider_avatar'  => $provider->profile_picture,
                    'last_message'     => $lastNote ? strip_tags($lastNote->description) : null,
                    'last_message_time'=> $lastNote ? DateHelper::timeAgo($lastNote->date_entered) : null,
                    'last_message_datetime' => $lastNote ? $lastNote->date_entered : null,
                    'unread_count'     => $unreadCount,
                    'contacted_date'   => DateHelper::timeAgo($provider->date_entered),
                    'sort_datetime'    => $sortDateTime, // For sorting
                ];
            }
        }
        
        // Sort by last message datetime descending (newest first)
        usort($conversations, function($a, $b) {
            $dateA = $a['sort_datetime'] ? strtotime($a['sort_datetime']) : 0;
            $dateB = $b['sort_datetime'] ? strtotime($b['sort_datetime']) : 0;
            return $dateB - $dateA; // Descending order
        });
        
        return response()->json([
            'status'  => 'success',
            'data'    => $conversations
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'status'  => 'error',
            'message' => $e->getMessage()
        ], 500);
    }
})->middleware('auth:sanctum');*/ // MOVED TO routes/api/leads.php

/*
|--------------------------------------------------------------------------
| GET MESSAGES FOR A SPECIFIC CONVERSATION (mobile)
|--------------------------------------------------------------------------
| MOVED TO routes/api/leads.php
*/
/*Route::get('/lead-notes/{leadId}/{providerId}', function (Request $request, $leadId, $providerId) {
    try {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'status'  => 'error',
                'message' => 'User not authenticated'
            ], 401);
        }

        // Construct comm_link (must match the send-message route logic)
        $comm_link = ($user->id < $providerId) 
            ? $user->id . '_' . $providerId 
            : $providerId . '_' . $user->id;

        // Also get the reverse order for backward compatibility with old messages
        $comm_link_reverse = ($user->id < $providerId) 
            ? $providerId . '_' . $user->id 
            : $user->id . '_' . $providerId;

        // Get all notes for this conversation (both comm_link formats)
        $notes = \App\Models\LeadsNotesModel::where('lead_id', $leadId)
            ->where(function($query) use ($comm_link, $comm_link_reverse) {
                $query->where('comm_link', $comm_link)
                      ->orWhere('comm_link', $comm_link_reverse);
            })
            ->orderBy('date_entered', 'asc')
            ->get();

        // Get provider info
        $provider = User::find($providerId);
        
        // Get service name from lead
        $lead = \App\Models\LeadsModel::with('service')->find($leadId);
        $serviceName = 'Service';
        if ($lead && $lead->service) {
            $serviceName = $lead->service->service_name;
        }

        return response()->json([
            'status'  => 'success',
            'data'    => $notes,
            'providerInfo' => $provider ? [
                'id'              => $provider->id,
                'first_name'      => $provider->first_name,
                'last_name'       => $provider->last_name,
                'profile_picture' => $provider->profile_picture,
            ] : null,
            'serviceName' => $serviceName
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'status'  => 'error',
            'message' => $e->getMessage()
        ], 500);
    }
})->middleware('auth:sanctum');*/ // MOVED TO routes/api/leads.php

/*
|--------------------------------------------------------------------------
| SEND MESSAGE IN CONVERSATION (mobile)
|--------------------------------------------------------------------------
| MOVED TO routes/api/leads.php
*/
/*Route::post('/send-message', function (Request $request) {
    try {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'status'  => 'error',
                'message' => 'User not authenticated'
            ], 401);
        }

        $request->validate([
            'lead_id'            => 'required|integer',
            'contacted_user_id'  => 'nullable|integer',
            'description'        => 'required|string|max:5000',
        ]);

        $leadId = $request->lead_id;
        $description = $request->description;
        
        // Get the lead to determine comm_link
        $lead = \App\Models\LeadsModel::find($leadId);
        if (!$lead) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Lead not found'
            ], 404);
        }

        // Determine the other party's user ID
        $otherUserId = $request->contacted_user_id ?? $lead->user_id;
        
        // Determine comm_link based on who is sending
        $comm_link = ($user->id < $otherUserId) 
            ? $user->id . '_' . $otherUserId 
            : $otherUserId . '_' . $user->id;

        // Create the note
        $note = \App\Models\LeadsNotesModel::create([
            'lead_id'     => $leadId,
            'description' => $description,
            'entered_by'  => $user->id,
            'user_id'     => $user->id,
            'comm_link'   => $comm_link,
        ]);

        // Get the other user for notification
        $otherUser = User::find($otherUserId);
        if ($otherUser) {
            // Send push notification (don't fail if notification fails)
            if ($otherUser->token) {
                try {
                    // Use unified notification service that handles both Expo and Firebase
                    \App\Services\ExpoPushNotification::sendNotificationToTokens(
                        [$otherUser->token],
                        "New message from " . $user->first_name,
                        strip_tags($description),
                        "fortai://chat/{$leadId}"
                    );
                } catch (\Throwable $notifError) {
                    // Log notification error but don't fail the request
                    error_log('Push notification failed: ' . $notifError->getMessage());
                }
            }
            
            // Create notification record in database
            try {
                // Get service name from lead (using Eloquent relationship)
                $serviceName = 'Service';
                if ($lead->service_id) {
                    $lead->load('service');
                    if ($lead->service) {
                        $serviceName = $lead->service->service_name;
                    }
                }
                
                DB::table('notifications')->insert([
                    'id' => \Illuminate\Support\Str::uuid(),
                    'type' => 'App\Notifications\ChatMessageNotification',
                    'notifiable_type' => 'App\Models\User',
                    'notifiable_id' => $otherUser->id,
                    'data' => json_encode([
                        'title' => 'New message from ' . $user->first_name,
                        'body' => strip_tags($description),
                        'url' => "fortai://chat/{$leadId}",
                        'type' => 'chat_message',
                        'lead_id' => $leadId,
                        'sender_id' => $user->id,
                        'sender_name' => $user->first_name . ' ' . $user->last_name,
                        'service_name' => $serviceName,
                    ]),
                    'read_at' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            } catch (\Throwable $e) {
                error_log('Failed to create notification record: ' . $e->getMessage());
            }
        }

        return response()->json([
            'status'  => 'success',
            'message' => 'Note Successfully added',
            'data'    => [
                'note' => $note,
                'date_entered' => date("Y-m-d H:i:s")
            ]
        ]);
    } catch (\Illuminate\Validation\ValidationException $e) {
        return response()->json([
            'status'  => 'error',
            'message' => 'Validation failed',
            'errors'  => $e->errors()
        ], 422);
    } catch (\Throwable $e) {
        return response()->json([
            'status'  => 'error',
            'message' => 'Failed to send message: ' . $e->getMessage()
        ], 500);
    }
})->middleware('auth:sanctum');*/ // MOVED TO routes/api/leads.php

/*
|--------------------------------------------------------------------------
| CONTACT LEAD (mobile) – with credit check
|--------------------------------------------------------------------------
| MOVED TO routes/api/leads.php
*/
/*Route::post('/contact-lead', function (Request $request) {
    try {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'status'  => 'error',
                'message' => 'User not authenticated'
            ], 401);
        }

        $leadId = (int) $request->input('lead_id');
        if (!$leadId) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Lead ID is required'
            ], 400);
        }

        $profileController = new ProfileController();
        $lead = $profileController->getIndividualLead($leadId);
        $leadsController   = new LeadsController();
        if (!$lead) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Lead not found'
            ], 404);
        }

        $credits         = $lead->credits;
        $credits_balance = $user->credits_balance;

        if ($credits_balance < $credits) {
            return response()->json([
                'message'           => 'No credits',
                'content'           => 'Insufficient credits. You need ' . $credits . ' credits to contact this lead.',
                'required_credits'  => $credits,
                'available_credits' => $credits_balance
            ]);
        }

        $contacts_count = (int) $leadsController->userResponse($leadId);
        if ($contacts_count >= 5) {
            return response()->json([
                'message' => 'Not Allowed',
                'content' => 'This lead has reached the maximum number of contacts (5).'
            ]);
        }

        DB::transaction(function () use ($user, $leadId, $credits, $lead) {
            $user->credits_balance = $user->credits_balance - $credits;
            $user->save();

            \App\Models\CreditsTrailModel::create([
                'user_id'  => $user->id,
                'lead_id'  => $leadId,
                'credits'  => -$credits, // Negative for usage
                'entered_by'=> $user->id,
                'transaction_type' => 'usage'
            ]);

            $description = "Hi,<br>
            My name is {$user->first_name}, and I have received your task via Fortai.<br>
            I would be happy to assist you with it.<br><br>
            Could we schedule a quick call to go over the details?<br>
            I look forward to hearing from you.";

            \App\Models\LeadsNotesModel::create([
                'lead_id'   => $leadId,
                'description'=> $description,
                'entered_by'=> $user->id,
                'user_id'   => $user->id,
                'comm_link' => $lead->user_id . '_' . $user->id
            ]);

            $existingContact = \App\Models\ContactedLeadsModel::where('lead_id', $leadId)
                ->where('user_id', $user->id)
                ->first();

            if (!$existingContact) {
                \App\Models\ContactedLeadsModel::create([
                    'user_id'   => $user->id,
                    'lead_id'   => $leadId,
                    'entered_by'=> $user->id,
                    'status'    => 'Pending',
                    'date_entered' => now()
                ]);

                // Notify customer that an expert has responded to their lead
                $leadOwner = User::find($lead->user_id);
                if ($leadOwner) {
                    $expertName = $user->first_name . ' ' . $user->last_name;
                    
                    // Send push notification
                    if ($leadOwner->token) {
                        try {
                            \App\Services\ExpoPushNotification::sendNotificationToTokens(
                                [$leadOwner->token],
                                "New Response to Your Lead",
                                "{$expertName} has responded to your lead",
                                "fortai://lead/{$leadId}"
                            );
                        } catch (\Throwable $notifError) {
                            error_log('Push notification failed: ' . $notifError->getMessage());
                        }
                    }
                    
                    // Create notification record in database
                    try {
                        if (class_exists(\App\Notifications\LeadResponseNotification::class)) {
                            $leadOwner->notify(new \App\Notifications\LeadResponseNotification($lead, $user));
                        } else {
                            // Fallback: create notification directly in database
                            DB::table('notifications')->insert([
                                'id' => \Illuminate\Support\Str::uuid(),
                                'type' => 'App\Notifications\LeadResponseNotification',
                                'notifiable_type' => 'App\Models\User',
                                'notifiable_id' => $leadOwner->id,
                                'data' => json_encode([
                                    'title' => 'New Response to Your Lead',
                                    'body' => $expertName . ' has responded to your lead',
                                    'url' => "fortai://lead/{$leadId}",
                                    'type' => 'lead_response',
                                    'lead_id' => $leadId,
                                    'expert_id' => $user->id,
                                ]),
                                'read_at' => null,
                                'created_at' => now(),
                                'updated_at' => now(),
                            ]);
                        }
                    } catch (\Throwable $e) {
                        error_log('Failed to create notification record: ' . $e->getMessage());
                    }
                }
            }
        });

        return response()->json([
            'message'           => 'Okay',
            'details'           => [
                'email'          => $lead->email,
                'contact_number' => $lead->contact_number
            ],
            'button'            => $user->id . '-' . $leadId,
            'credits_deducted'  => $credits,
            'remaining_credits' => $user->credits_balance
        ]);

    } catch (\Throwable $e) {
        return response()->json([
            'status'  => 'error',
            'message' => 'There is an error: ' . $e->getMessage()
        ], 500);
    }
})->middleware('auth:sanctum');*/ // MOVED TO routes/api/leads.php

/*
|--------------------------------------------------------------------------
| UNLOCK CUSTOMER INFO (mobile)
|--------------------------------------------------------------------------
| MOVED TO routes/api/leads.php
*/
/*Route::post('/unlock-customer-info', function (Request $request) {
    try {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'status'  => 'error',
                'message' => 'User not authenticated'
            ], 401);
        }

        $leadId       = $request->input('lead_id');
        $creditsToPay = (int) $request->input('credits', 10);

        if (!$leadId) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Lead ID is required'
            ], 400);
        }

        // Use Eloquent model instead of DB::table
        $existingUnlock = \App\Models\LeadUnlockModel::where('lead_id', $leadId)
            ->where('provider_id', $user->id)
            ->first();

        if ($existingUnlock) {
            return response()->json([
                'status'  => 'success',
                'message' => 'Customer information already unlocked',
                'data'    => ['already_unlocked' => true]
            ]);
        }

        if ($user->credits_balance < $creditsToPay) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Insufficient credits. You need ' . $creditsToPay . ' credits to unlock customer information.'
            ], 400);
        }

        // Check if expert has already contacted this lead
        $existingContact = \App\Models\ContactedLeadsModel::where('lead_id', $leadId)
            ->where('user_id', $user->id)
            ->first();

        DB::transaction(function () use ($user, $leadId, $creditsToPay, $existingContact) {
            // Use Eloquent model instead of DB::table
            $user->decrement('credits_balance', $creditsToPay);

            // Record credit usage in credits_trail
            \App\Models\CreditsTrailModel::create([
                'user_id'  => $user->id,
                'lead_id'  => $leadId,
                'credits'  => -$creditsToPay, // Negative for usage
                'entered_by'=> $user->id,
                'transaction_type' => 'usage'
            ]);

            // Use Eloquent model instead of DB::table
            \App\Models\LeadUnlockModel::create([
                'lead_id'      => $leadId,
                'provider_id'  => $user->id,
                'credits_paid' => $creditsToPay,
                'unlocked_at'  => now(),
                'created_at'   => now(),
                'updated_at'   => now()
            ]);

            // If not already contacted, create a contacted_leads entry to move lead to My Responses
            if (!$existingContact) {
                \App\Models\ContactedLeadsModel::create([
                    'user_id' => $user->id,
                    'lead_id' => $leadId,
                    'entered_by' => $user->id,
                    'status' => 'Pending',
                    'date_entered' => now()
                ]);
            }
        });

        // Notify customer that an expert has unlocked their contact info
        $lead = \App\Models\LeadsModel::find($leadId);
        if ($lead) {
            $leadOwner = User::find($lead->user_id);
            if ($leadOwner) {
                $expertName = $user->first_name . ' ' . $user->last_name;
                
                // Send push notification
                if ($leadOwner->token) {
                    try {
                        \App\Services\ExpoPushNotification::sendNotificationToTokens(
                            [$leadOwner->token],
                            "Contact Info Unlocked",
                            "{$expertName} has unlocked your contact information",
                            "fortai://lead/{$leadId}"
                        );
                    } catch (\Throwable $notifError) {
                        error_log('Push notification failed: ' . $notifError->getMessage());
                    }
                }
                
                // Create notification record
                try {
                    if (class_exists(\App\Notifications\LeadUnlockedNotification::class)) {
                        $leadOwner->notify(new \App\Notifications\LeadUnlockedNotification($lead, $user));
                    } else {
                        // Fallback: create notification directly in database
                        DB::table('notifications')->insert([
                            'id' => \Illuminate\Support\Str::uuid(),
                            'type' => 'App\Notifications\LeadUnlockedNotification',
                            'notifiable_type' => 'App\Models\User',
                            'notifiable_id' => $leadOwner->id,
                            'data' => json_encode([
                                'title' => 'Contact Info Unlocked',
                                'body' => $expertName . ' has unlocked your contact information',
                                'url' => "fortai://lead/{$leadId}",
                                'type' => 'lead_unlocked',
                                'lead_id' => $leadId,
                                'expert_id' => $user->id,
                            ]),
                            'read_at' => null,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }
                } catch (\Throwable $e) {
                    error_log('Failed to create notification record: ' . $e->getMessage());
                }
            }
        }

        return response()->json([
            'status'  => 'success',
            'message' => 'Customer information unlocked successfully',
            'data'    => [
                'credits_deducted'  => $creditsToPay,
                'remaining_credits' => $user->credits_balance - $creditsToPay
            ]
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'status'  => 'error',
            'message' => $e->getMessage()
        ], 500);
    }
})->middleware('auth:sanctum');*/ // MOVED TO routes/api/leads.php

/*
|--------------------------------------------------------------------------
| GET CHAT MESSAGES (mobile)
|--------------------------------------------------------------------------
| MOVED TO routes/api/leads.php
*/
/*Route::get('/chat-messages/{leadId}', function (Request $request, $leadId) {
    try {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'status'  => 'error',
                'message' => 'User not authenticated'
            ], 401);
        }

        $lead = \App\Models\LeadsModel::find($leadId);
        if (!$lead) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Lead not found'
            ], 404);
        }

        // Eager load user relationship to avoid N+1 queries
        $messages = \App\Models\LeadsNotesModel::where('lead_id', $leadId)
            ->with('user') // Eager load user to prevent N+1 queries
            ->orderBy('date_entered', 'asc')
            ->get();

        $formatted = $messages->map(function ($m) use ($user) {
            $isFromCurrent = $m->user_id == $user->id;
            $sender        = $isFromCurrent ? 'You' : ($m->user ? $m->user->first_name . ' ' . $m->user->last_name : 'Unknown');
            return [
                'id'                => $m->id,
                'message'           => $m->description,
                'sender_id'         => $m->user_id,
                'sender_name'       => $sender ?: 'Unknown',
                'is_from_current_user' => $isFromCurrent,
                'date_entered'      => $m->date_entered,
                'comm_link'         => $m->comm_link
            ];
        });

        return response()->json([
            'status'   => 'success',
            'messages' => $formatted,
            'lead'     => [
                'id'            => $lead->id,
                'customer_name' => $lead->first_name . ' ' . $lead->last_name,
                'customer_email'=> $lead->email
            ]
        ]);

    } catch (\Throwable $e) {
        return response()->json([
            'status'  => 'error',
            'message' => $e->getMessage()
        ], 500);
    }
})->middleware('auth:sanctum');

/*
|--------------------------------------------------------------------------
| MOBILE SESSION ENDPOINTS (now using central auth)
|--------------------------------------------------------------------------
| MOVED TO routes/api/mobile.php
*/
/*Route::post('/mobile/session/validate', function (Request $request) {
    try {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'status'  => 'error',
                'message' => 'User not authenticated'
            ], 401);
        }

        if (!$user->email_verified_at) {
            return response()->json([
                'status'  => 'error',
                'message' => 'User account not verified'
            ], 401);
        }

        $sessionTimeout = 7 * 24 * 60 * 60;
        $lastActivity   = $user->last_activity_at;

        if ($lastActivity && (time() - strtotime($lastActivity)) > $sessionTimeout) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Session expired - please login again'
            ], 401);
        }

        $user->update(['last_activity_at' => now()]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Session valid',
            'user'    => [
                'id'    => $user->id,
                'name'  => $user->first_name . ' ' . $user->last_name,
                'email' => $user->email,
                'role'  => $user->role
            ]
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'status'  => 'error',
            'message' => 'Session validation failed: ' . $e->getMessage()
        ], 500);
    }
})->middleware('auth:sanctum');*/ // MOVED TO routes/api/mobile.php

/*Route::post('/mobile/session/refresh', function (Request $request) {
    try {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'status'  => 'error',
                'message' => 'User not authenticated'
            ], 401);
        }

        $user->update(['last_activity_at' => now()]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Session refreshed successfully',
            'data'    => [
                'user'        => [
                    'id'    => $user->id,
                    'name'  => $user->first_name . ' ' . $user->last_name,
                    'email' => $user->email,
                    'role'  => $user->role
                ],
                'refreshed_at'=> now()->toISOString()
            ]
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'status'  => 'error',
            'message' => 'Session refresh failed: ' . $e->getMessage()
        ], 500);
    }
})->middleware('auth:sanctum');*/ // MOVED TO routes/api/mobile.php

/*
|--------------------------------------------------------------------------
| MOBILE - LEAD STATUS MANAGEMENT
|--------------------------------------------------------------------------
| MOVED TO routes/api/leads.php
*/
// Get experts who responded to a lead (for "hired someone" selection)
/*Route::get('/mobile/lead/{id}/experts', function (Request $request, $id) {
    try {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'status'  => 'error',
                'message' => 'User not authenticated'
            ], 401);
        }

        $lead = \App\Models\LeadsModel::find($id);
        if (!$lead || $lead->user_id !== $user->id) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Lead not found or access denied'
            ], 404);
        }

        $experts = \App\Models\ContactedLeadsModel::join('users', 'contacted_lead.user_id', '=', 'users.id')
            ->select('users.id', 'users.first_name', 'users.last_name')
            ->where('contacted_lead.lead_id', $id)
            ->get();

        return response()->json([
            'status' => 'success',
            'data'   => $experts
        ], 200);
    } catch (\Exception $e) {
        return response()->json([
            'status'  => 'error',
            'message' => $e->getMessage()
        ], 500);
    }
})->middleware('auth:sanctum');*/ // MOVED TO routes/api/leads.php

// Update lead status (close request or mark as hired)
/*Route::post('/mobile/lead/{id}/update-status', function (Request $request, $id) {
    try {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'status'  => 'error',
                'message' => 'User not authenticated'
            ], 401);
        }

        $lead = \App\Models\LeadsModel::find($id);
        if (!$lead || $lead->user_id !== $user->id) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Lead not found or access denied'
            ], 404);
        }

        $request->validate([
            'status'            => 'required|string|in:hired,unavailable',
            'hired_expert_id'   => 'nullable|integer',
            'closed_description'=> 'nullable|string|max:500',
        ]);

        $status = $request->status;
        $hired_expert_id = (int)($request->hired_expert_id ?? 0);
        $closed_description = $request->closed_description ?? '';

        // Map status to database values
        if ($status === 'hired') {
            $status = 'Bought';
        } elseif ($status === 'unavailable') {
            $status = 'Unavailable';
        }

        $details = [
            'status'            => $status,
            'hired_expert_id'   => $hired_expert_id > 0 ? $hired_expert_id : null,
            'closed_by'         => $user->id,
            'date_closed'       => date('Y-m-d H:i:s'),
            'closed_description'=> $closed_description
        ];

        $oldStatus = $lead->status;
        $lead->update($details);
        $lead->refresh();

        // Notify expert if lead was hired/completed
        if ($status === 'Bought' && $hired_expert_id > 0) {
            $expert = User::find($hired_expert_id);
            if ($expert && $expert->token) {
                try {
                    \App\Services\ExpoPushNotification::sendNotificationToTokens(
                        [$expert->token],
                        "Task Completed",
                        "You have been hired for a task!",
                        "fortai://lead/{$id}"
                    );
                } catch (\Throwable $notifError) {
                    error_log('Push notification failed: ' . $notifError->getMessage());
                }
            }
        }

        // Notify all contacted experts if lead is closed/completed
        if (in_array($status, ['Bought', 'Unavailable'])) {
            // Eager load user relationship to avoid N+1 queries
            $contactedExperts = \App\Models\ContactedLeadsModel::where('lead_id', $id)
                ->where('user_id', '!=', $user->id) // Don't notify the customer
                ->with('user') // Eager load user to prevent N+1 queries
                ->get();
            
            foreach ($contactedExperts as $contacted) {
                $expert = $contacted->user;
                if ($expert && $expert->token) {
                    try {
                        $statusText = $status === 'Bought' ? 'completed' : 'closed';
                        \App\Services\ExpoPushNotification::sendNotificationToTokens(
                            [$expert->token],
                            "Task {$statusText}",
                            "A lead you responded to has been {$statusText}",
                            "fortai://lead/{$id}"
                        );
                    } catch (\Throwable $notifError) {
                        error_log('Push notification failed: ' . $notifError->getMessage());
                    }
                }
            }
        }

        return response()->json([
            'status'  => 'success',
            'message' => 'Lead status updated successfully',
            'data'    => [
                'id'     => $lead->id,
                'status' => $lead->status
            ]
        ], 200);
    } catch (\Exception $e) {
        return response()->json([
            'status'  => 'error',
            'message' => $e->getMessage()
        ], 500);
    }
})->middleware('auth:sanctum');*/ // MOVED TO routes/api/leads.php

/*
|--------------------------------------------------------------------------
| MOBILE - GLOBAL SEARCH
|--------------------------------------------------------------------------
| MOVED TO routes/api/search.php
*/
/*Route::get('/mobile/search', function (Request $request) {
    try {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'status'  => 'error',
                'message' => 'User not authenticated'
            ], 401);
        }

        $query = $request->input('q', '');
        if (empty(trim($query))) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Search query is required'
            ], 400);
        }

        $searchTerm = '%' . trim($query) . '%';
        $results = [
            'requests' => [],
            'chats' => [],
            'services' => [],
            'leads' => [], // Available leads for providers
            'users' => [], // Search users/providers
        ];

        // Search in ALL requests/leads (not just user's own)
        // For customers: show their requests
        // For providers: show all available leads
        if ($user->role === 'Customer') {
            $requests = \App\Models\LeadsModel::select(
                    'leads.id',
                    'leads.description',
                    'leads.location',
                    'leads.status',
                    'leads.date_entered',
                    'leads.credits',
                    'master_services.service_name'
                )
                ->join('master_services', 'leads.service_id', '=', 'master_services.id')
                ->where('leads.user_id', $user->id)
                ->where(function($q) use ($searchTerm) {
                    $q->where('leads.description', 'LIKE', $searchTerm)
                      ->orWhere('leads.location', 'LIKE', $searchTerm)
                      ->orWhere('leads.zipcode', 'LIKE', $searchTerm)
                      ->orWhere('master_services.service_name', 'LIKE', $searchTerm);
                })
                ->orderBy('leads.id', 'desc')
                ->limit(20)
                ->get();

            $results['requests'] = $requests->map(function($lead) {
                return [
                    'id' => $lead->id,
                    'title' => $lead->service_name,
                    'description' => $lead->description,
                    'location' => $lead->location,
                    'status' => $lead->status,
                    'date' => $lead->date_entered,
                    'credits' => $lead->credits,
                    'type' => 'request'
                ];
            });
        } else {
            // For providers: search available leads (simplified query)
            // Get provider's service IDs first
            $userServiceIds = \App\Models\UserServicesModel::where('user_id', $user->id)
                ->pluck('service_id')
                ->toArray();
            
            if (!empty($userServiceIds)) {
                $leads = \App\Models\LeadsModel::select(
                        'leads.id',
                        'leads.description',
                        'leads.location',
                        'leads.status',
                        'leads.date_entered',
                        'leads.credits',
                        'leads.urgent',
                        'master_services.service_name'
                    )
                    ->join('master_services', 'leads.service_id', '=', 'master_services.id')
                    ->where('leads.status', 'Open')
                    ->whereIn('leads.service_id', $userServiceIds) // Only leads matching provider's services
                    ->whereNotIn('leads.id', function ($query) use ($user) {
                        // Exclude leads already contacted by this provider
                        $query->select('lead_id')
                            ->from('contacted_lead')
                            ->where('user_id', $user->id);
                    })
                    ->where(function($q) use ($searchTerm) {
                        $q->where('leads.description', 'LIKE', $searchTerm)
                          ->orWhere('leads.location', 'LIKE', $searchTerm)
                          ->orWhere('leads.zipcode', 'LIKE', $searchTerm)
                          ->orWhere('master_services.service_name', 'LIKE', $searchTerm);
                    })
                    ->orderBy('leads.urgent', 'desc')
                    ->orderBy('leads.id', 'desc')
                    ->limit(20)
                    ->get();

                $results['leads'] = $leads->map(function($lead) {
                    return [
                        'id' => $lead->id,
                        'title' => $lead->service_name,
                        'description' => $lead->description,
                        'location' => $lead->location,
                        'status' => $lead->status,
                        'date' => $lead->date_entered,
                        'credits' => $lead->credits,
                        'urgent' => $lead->urgent,
                        'type' => 'lead'
                    ];
                });
            } else {
                $results['leads'] = [];
            }
        }

        // Search in chats/conversations - expand search to all related data
        $chats = \App\Models\ContactedLeadsModel::select(
                'contacted_lead.lead_id',
                'contacted_lead.user_id as provider_id',
                'users.first_name',
                'users.last_name',
                'users.company_name',
                'users.location as user_location',
                'leads.description',
                'leads.location as lead_location',
                'master_services.service_name'
            )
            ->join('users', 'contacted_lead.user_id', '=', 'users.id')
            ->join('leads', 'contacted_lead.lead_id', '=', 'leads.id')
            ->leftJoin('master_services', 'leads.service_id', '=', 'master_services.id')
            ->where(function($q) use ($user) {
                if ($user->role === 'Customer') {
                    $q->where('leads.user_id', $user->id);
                } else {
                    $q->where('contacted_lead.user_id', $user->id);
                }
            })
            ->where(function($q) use ($searchTerm) {
                $q->where('users.first_name', 'LIKE', $searchTerm)
                  ->orWhere('users.last_name', 'LIKE', $searchTerm)
                  ->orWhere('users.company_name', 'LIKE', $searchTerm)
                  ->orWhere('users.location', 'LIKE', $searchTerm)
                  ->orWhere('master_services.service_name', 'LIKE', $searchTerm)
                  ->orWhere('leads.description', 'LIKE', $searchTerm)
                  ->orWhere('leads.location', 'LIKE', $searchTerm);
            })
            ->orderBy('contacted_lead.id', 'desc')
            ->limit(20)
            ->get();

        $results['chats'] = $chats->map(function($chat) {
            return [
                'lead_id' => $chat->lead_id,
                'provider_id' => $chat->provider_id,
                'provider_name' => $chat->first_name . ' ' . $chat->last_name,
                'company_name' => $chat->company_name,
                'service_name' => $chat->service_name,
                'description' => $chat->description,
                'location' => $chat->lead_location,
                'type' => 'chat'
            ];
        });

        // Search in services - only search services that user has access to
        // For customers: show all services (they can use any service)
        // For providers: show only their own services or all services they can see
        if ($user->role === 'Customer') {
            // Customers can search all services
            $services = \App\Models\ServicesModel::select('id', 'service_name')
                ->where('service_name', 'LIKE', $searchTerm)
                ->limit(20)
                ->get();
        } else {
            // Providers: search all services (they can see all services)
            $services = \App\Models\ServicesModel::select('id', 'service_name')
                ->where('service_name', 'LIKE', $searchTerm)
                ->limit(20)
                ->get();
        }

        $results['services'] = $services->map(function($service) {
            return [
                'id' => $service->id,
                'name' => $service->service_name,
                'description' => null, // Description column doesn't exist in master_services table
                'type' => 'service'
            ];
        });

        // Search in users/providers - only users they've interacted with in chats
        try {
            if ($user->role === 'Customer') {
                // Customers: show providers from their chats
                $users = \App\Models\User::select('users.id', 'users.first_name', 'users.last_name', 'users.company_name', 'users.location', 'users.role', 'users.profile_picture')
                    ->join('contacted_lead', 'users.id', '=', 'contacted_lead.user_id')
                    ->join('leads', 'contacted_lead.lead_id', '=', 'leads.id')
                    ->where('leads.user_id', $user->id)
                    ->where(function($q) use ($searchTerm) {
                        $q->where('users.first_name', 'LIKE', $searchTerm)
                          ->orWhere('users.last_name', 'LIKE', $searchTerm)
                          ->orWhere('users.company_name', 'LIKE', $searchTerm)
                          ->orWhere('users.location', 'LIKE', $searchTerm);
                    })
                    ->distinct()
                    ->limit(15)
                    ->get();
            } else {
                // Providers: show customers from their chats
                $users = \App\Models\User::select('users.id', 'users.first_name', 'users.last_name', 'users.company_name', 'users.location', 'users.role', 'users.profile_picture')
                    ->join('leads', 'users.id', '=', 'leads.user_id')
                    ->join('contacted_lead', 'leads.id', '=', 'contacted_lead.lead_id')
                    ->where('contacted_lead.user_id', $user->id)
                    ->where(function($q) use ($searchTerm) {
                        $q->where('users.first_name', 'LIKE', $searchTerm)
                          ->orWhere('users.last_name', 'LIKE', $searchTerm)
                          ->orWhere('users.location', 'LIKE', $searchTerm);
                    })
                    ->distinct()
                    ->limit(15)
                    ->get();
            }
            
            $results['users'] = $users->map(function($foundUser) {
                return [
                    'id' => $foundUser->id,
                    'name' => $foundUser->first_name . ' ' . $foundUser->last_name,
                    'company_name' => $foundUser->company_name,
                    'location' => $foundUser->location,
                    'role' => $foundUser->role,
                    'profile_picture' => $foundUser->profile_picture,
                    'type' => 'user'
                ];
            });
        } catch (\Exception $e) {
            Log::error('Search users error: ' . $e->getMessage());
            $results['users'] = [];
        }

        $totalResults = count($results['requests']) + count($results['chats']) + count($results['services']) + count($results['leads']) + count($results['users']);

        return response()->json([
            'status' => 'success',
            'query' => $query,
            'total_results' => $totalResults,
            'data' => $results
        ], 200);
    } catch (\Exception $e) {
        return response()->json([
            'status'  => 'error',
            'message' => $e->getMessage()
        ], 500);
    }
})->middleware('auth:sanctum');*/ // MOVED TO routes/api/search.php

/*Route::post('/mobile/session/logout', function (Request $request) {
    try {
        $user = $request->user();
        if ($user) {
            $user->update([
                'last_activity_at' => null,
                'logout_at'        => now()
            ]);
        }

        return response()->json([
            'status'  => 'success',
            'message' => 'Logged out successfully'
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'status'  => 'error',
            'message' => 'Logout failed: ' . $e->getMessage()
        ], 500);
    }
})->middleware('auth:sanctum');*/ // MOVED TO routes/api/mobile.php

/*
|--------------------------------------------------------------------------
| DEBUG / TOKEN
|--------------------------------------------------------------------------
| MOVED TO routes/api/debug.php
*/
/*Route::get('/debug-token', function (Request $request) {
    try {
        $user = $request->user();

        return response()->json([
            'success'     => true,
            'auth_header' => $request->header('Authorization'),
            'user'        => $user ? [
                'id'    => $user->id,
                'email' => $user->email,
                'name'  => trim(($user->first_name ?? '') . ' ' . ($user->last_name ?? ''))
            ] : null,
            'message'     => 'Token debug successful'
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'success' => false,
            'message' => 'Token debug failed: ' . $e->getMessage()
        ], 500);
    }
});*/ // MOVED TO routes/api/debug.php

/*
|--------------------------------------------------------------------------
| CURRENT USER (sanctum)
|--------------------------------------------------------------------------
*/
/*Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});*/ // MOVED TO routes/api/users.php

/*
|--------------------------------------------------------------------------
| LOGOUT (manual – using token from header)
|--------------------------------------------------------------------------
| MOVED TO routes/api/users.php
*/
/*Route::post('/logout', function (Request $request) {
    try {
        $user = $request->user();

        if ($user) {
            $authHeader = $request->header('Authorization');
            if ($authHeader && str_starts_with($authHeader, 'Bearer ')) {
                $token     = trim(substr($authHeader, 7));
                $tokenHash = hash('sha256', $token);

                DB::table('personal_access_tokens')
                    ->where('tokenable_id', $user->id)
                    ->where('token', $tokenHash)
                    ->delete();
            }
        }

        return response()->json([
            'status'  => 'success',
            'message' => 'Logged out successfully'
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'status'  => 'error',
            'message' => $e->getMessage()
        ], 500);
    }
});

/*
||--------------------------------------------------------------------------
|| PORTFOLIO MANAGEMENT (mobile)
||--------------------------------------------------------------------------
| MOVED TO routes/api/users.php
*/
/*Route::get('/user/portfolio', function (Request $request) {
    try {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated'
            ], 401);
        }

        // Get user's portfolio images
        $portfolio = \App\Models\PortfolioModel::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        // Convert relative URLs to full URLs for mobile app using asset() helper
        $portfolio = $portfolio->map(function ($item) {
            if (!str_starts_with($item->image_url, 'http')) {
                $item->image_url = asset($item->image_url);
            }
            return $item;
        });

        return response()->json([
            'success' => true,
            'data' => $portfolio
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to load portfolio: ' . $e->getMessage()
        ], 500);
    }
})->middleware('auth:sanctum');*/ // MOVED TO routes/api/users.php

/*Route::post('/user/portfolio', function (Request $request) {
    try {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated'
            ], 401);
        }

        // Check if user has reached the limit of 10 portfolio items
        $currentCount = \App\Models\PortfolioModel::where('user_id', $user->id)->count();
        if ($currentCount >= 10) {
            return response()->json([
                'success' => false,
                'message' => 'Portfolio limit reached. You can only have up to 10 images. Please delete an existing image to add a new one.'
            ], 400);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'contact_person' => 'nullable|string|max:255',
            'contact_number' => 'nullable|string|max:20',
            'image' => 'required|image|mimes:jpeg,png,jpg|max:5120',
        ]);

        // Store uploaded image
        try {
            $imagePath = $request->file('image')->store('portfolio', 'public');
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error("Failed to store portfolio image", [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
        
        // For mobile app, return full URL with relative path
        // Store relative path in database, mobile app will construct full URL
        $imageUrl = 'storage/' . $imagePath;

        // Create portfolio entry
        try {
            $portfolioItem = \App\Models\PortfolioModel::create([
                'user_id' => $user->id,
                'title' => $request->title,
                'description' => $request->description,
                'contact_person' => $request->contact_person,
                'contact_number' => $request->contact_number,
                'image_path' => $imagePath,
                'image_url' => $imageUrl,
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error("Failed to create portfolio item", [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
            // Delete the uploaded file if database insert fails
            Storage::disk('public')->delete($imagePath);
            throw $e;
        }

        // Convert relative URL to absolute URL for mobile app
        // Use asset() helper which respects APP_URL from .env
        $portfolioItem->image_url = asset($imageUrl);

        return response()->json([
            'success' => true,
            'message' => 'Image added to portfolio successfully',
            'data' => $portfolioItem
        ]);
    } catch (\Illuminate\Validation\ValidationException $e) {
        return response()->json([
            'success' => false,
            'message' => 'Validation failed',
            'errors' => $e->errors()
        ], 422);
    } catch (\Throwable $e) {
        error_log("Portfolio upload error: " . $e->getMessage());
        error_log("Stack trace: " . $e->getTraceAsString());
        return response()->json([
            'success' => false,
            'message' => 'Failed to add to portfolio: ' . $e->getMessage(),
            'error_details' => [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]
        ], 500);
    }
})->middleware('auth:sanctum');*/ // MOVED TO routes/api/users.php

/*Route::delete('/user/portfolio/{id}', function (Request $request, $id) {
    try {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated'
            ], 401);
        }

        // Find portfolio item
        $portfolioItem = \App\Models\PortfolioModel::where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$portfolioItem) {
            return response()->json([
                'success' => false,
                'message' => 'Portfolio item not found'
            ], 404);
        }

        // Delete image from storage
        if ($portfolioItem->image_url) {
            Storage::disk('public')->delete($portfolioItem->image_url);
        }

        // Delete portfolio item
        $portfolioItem->delete();

        return response()->json([
            'success' => true,
            'message' => 'Portfolio item deleted successfully'
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to delete portfolio item: ' . $e->getMessage()
        ], 500);
    }
})->middleware('auth:sanctum');*/ // MOVED TO routes/api/users.php

/*
|--------------------------------------------------------------------------
| GET EXPERT/PROVIDER PROFILE (mobile) - for customers to view
|--------------------------------------------------------------------------
| MOVED TO routes/api/users.php
*/
/*Route::get('/expert-profile/{expertId}', function (Request $request, $expertId) {
    try {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'status'  => 'error',
                'message' => 'User not authenticated'
            ], 401);
        }

        $expert = User::find($expertId);
        if (!$expert) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Expert not found'
            ], 404);
        }

        // Get expert services
        $services = \App\Models\UserServicesModel::where('user_id', $expertId)
            ->join('master_services', 'user_services.service_id', '=', 'master_services.id')
            ->select('master_services.service_name', 'master_services.id as service_id')
            ->get();

        // Get expert portfolio
        $portfolio = \App\Models\PortfolioModel::where('user_id', $expertId)
            ->select('id', 'image_url', 'description', 'created_at', 'title', 'contact_person', 'contact_number')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($item) {
                $imageUrl = $item->image_url;
                if (!str_starts_with($imageUrl, 'http')) {
                    $imageUrl = asset($imageUrl);
                }
                return [
                    'id' => $item->id,
                    'image_url' => $imageUrl,
                    'description' => $item->description,
                    'title' => $item->title,
                    'contact_person' => $item->contact_person,
                    'contact_number' => $item->contact_number,
                    'created_at' => $item->created_at,
                ];
            });

        // Get expert reviews/ratings
        $reviews = \App\Models\RatingsModel::where('to_user_id', $expertId)
            ->join('users', 'ratings.from_user_id', '=', 'users.id')
            ->select(
                'ratings.id',
                'ratings.rating',
                'ratings.comment',
                'ratings.date_entered',
                'users.first_name',
                'users.last_name'
            )
            ->orderBy('ratings.id', 'desc')
            ->get();

        // Calculate average rating
        $avgRating = $reviews->avg('rating');
        $totalReviews = $reviews->count();

        return response()->json([
            'status'  => 'success',
            'data'    => [
                'id'              => $expert->id,
                'first_name'      => $expert->first_name,
                'last_name'       => $expert->last_name,
                'email'           => $expert->email,
                'contact_number'  => $expert->contact_number,
                'location'        => $expert->location,
                'biography'       => $expert->biography,
                'company_name'    => $expert->company_name,
                'profile_picture' => $expert->profile_picture ? $expert->profile_picture : null,
                'services'        => $services,
                'portfolio'       => $portfolio,
                'reviews'         => $reviews,
                'average_rating'  => round($avgRating, 1),
                'total_reviews'   => $totalReviews,
            ]
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'status'  => 'error',
            'message' => $e->getMessage()
        ], 500);
    }
})->middleware('auth:sanctum');*/ // MOVED TO routes/api/users.php

/*
|--------------------------------------------------------------------------
| SUBMIT REVIEW/RATING (mobile)
|--------------------------------------------------------------------------
| MOVED TO routes/api/ratings.php
*/
/*Route::post('/submit-review', function (Request $request) {
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
})->middleware('auth:sanctum');*/ // MOVED TO routes/api/ratings.php

/*
|--------------------------------------------------------------------------
| END
|--------------------------------------------------------------------------
*/
