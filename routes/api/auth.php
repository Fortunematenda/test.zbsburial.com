<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\User;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Helpers\CacheHelper;
use App\Helpers\RatingHelper;
use App\Helpers\ApiErrorHandler;
use App\Http\Requests\ApiLoginRequest;

/*
|--------------------------------------------------------------------------
| AUTHENTICATION ROUTES
|--------------------------------------------------------------------------
| Routes for user registration, login, OTP verification, and password management
*/

// Test registration (development only)
Route::post('/test-register', function (Request $request) {
    return response()->json([
        'status'  => 'success',
        'message' => 'Test registration successful',
        'data'    => $request->all()
    ]);
});

// Multi-step register (real) - Rate limited to 3 attempts per minute
Route::post('/simple-register', function (Request $request) {
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
        } catch (\Throwable $e) {
            return ApiErrorHandler::handle($e, 'user_registration', ['email' => $request->email], 500);
        }

        // Attach up to 5 services for providers/experts
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
            // Default service
            \App\Models\UserServicesModel::create([
                'user_id'   => $user->id,
                'service_id'=> 1,
                'entered_by'=> $user->id,
            ]);
        }

        // Create OTP
        $otp = rand(1000, 9999);
        \App\Models\Otp::create([
            'user_id'    => $user->id,
            'otp'        => $otp,
            'expires_at' => Carbon::now()->addMinutes(10),
        ]);

        // Attempt to send OTP via email
        try {
            $user->notify(new \App\Notifications\SendOtpNotification($otp));
        } catch (\Throwable $e) {
            \Log::info("OTP for {$user->email}: {$otp}");
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
        return ApiErrorHandler::handleValidationError($e);
    } catch (\Throwable $e) {
        return ApiErrorHandler::handle($e, 'user_registration', [], 500);
    }
})->middleware('throttle:3,1'); // 3 attempts per minute

// OTP verification (mobile)
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
            return ApiErrorHandler::handleNotFound('User', $request->user_id);
        }

        // If leadData is present, this is a customer flow. Coerce role to Customer
        if ($request->has('leadData') && $user->role !== 'Customer') {
            try {
                $user->role = 'Customer';
                $user->save();
                $user = User::find($request->user_id); // Refresh
            } catch (\Throwable $e) {
                \Log::error('Failed to set role to Customer during OTP: ' . $e->getMessage());
            }
        }

        // Issue Sanctum token
        $token = $user->createToken('mobile-app')->plainTextToken;
        $user->update(['token' => $token]);

        // For customers, create lead after OTP verification
        if ($user->role === 'Customer' && $request->has('leadData')) {
            try {
                $leadData = $request->leadData;
                $service_id = (int)($leadData['service_id'] ?? 0);
                
                if ($service_id > 0) {
                    $customer = new CustomerController();
                    $num_leads = $customer->getLeadsNumber($user->id);
                    
                    if ($num_leads < 2) { // Allow 2 leads per day for free customers
                        $description = $leadData['description'] ?? "N/A";
                        $estimate_quote = $leadData['estimate_quote'] ?? 0;
                        $urgent = $leadData['urgent'] ?? 0;
                        $hiring_decision = $leadData['hiring_decision'] ?? 0;
                        
                        $lead = $customer->createLead(
                            $user->id, 
                            $service_id, 
                            $user->id, 
                            $description, 
                            $estimate_quote, 
                            $urgent, 
                            $hiring_decision, 
                            $user->longitude, 
                            $user->latitude, 
                            $user->location
                        );
                        
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
                            }
                        }
                        
                        // Send notifications to nearby experts
                        $services = CacheHelper::getServices();
                        $service = $services->where('id', $service_id)->first();
                        if ($service) {
                            $profile = new ProfileController();
                            $tokens = $profile->getUsersForNotifications($user->id, $service_id, $user->latitude, $user->longitude);
                            if (count($tokens) > 0) {
                                \App\Services\ExpoPushNotification::sendNotificationToTokens(
                                    $tokens,
                                    "New Lead near you!!!",
                                    "You have received new lead for ".$service->service_name,
                                    "fortai://lead/{$lead->id}"
                                );
                                
                                // Create notification records in database
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
                                        \Log::error('Failed to create notification record: ' . $e->getMessage());
                                    }
                                }
                            }
                        }
                    }
                }
            } catch (\Throwable $e) {
                \Log::error("Lead creation error during OTP verification: " . $e->getMessage());
                // Continue even if lead creation fails
            }
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
        return ApiErrorHandler::handleValidationError($e);
    } catch (\Throwable $e) {
        return ApiErrorHandler::handle($e, 'otp_verification', [], 500);
    }
})->middleware('throttle:3,1');

// Simple login (mobile) - Rate limited to 5 attempts per minute
Route::post('/simple-login', function (ApiLoginRequest $request) {
    try {
        // Validation is handled by ApiLoginRequest Form Request class
        
        try {
            $user = User::where('email', $request->email)->first();
        } catch (\Illuminate\Database\QueryException $dbError) {
            return ApiErrorHandler::handleDatabaseError($dbError);
        }
        
        if (!$user) {
            return ApiErrorHandler::handleNotFound('Account');
        }

        if (!Hash::check($request->password, $user->password)) {
            return ApiErrorHandler::handleAuthError('Invalid password');
        }

        $token = $user->createToken('mobile-app')->plainTextToken;
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
        return ApiErrorHandler::handle($e, 'user_login', [], 500);
    }
})->middleware('throttle:5,1'); // 5 attempts per minute

// Public auth endpoints for SPA (using controllers)
Route::prefix('auth')->group(function () {
    Route::post('login', [AuthenticatedSessionController::class, 'store']);
    Route::post('register', [RegisteredUserController::class, 'store']);
    Route::post('verify-otp', [RegisteredUserController::class, 'verifyOtp']);
    Route::post('resend-otp', [RegisteredUserController::class, 'resendOtp']);
    Route::post('forgot-password', [PasswordResetLinkController::class, 'store']);
    Route::post('reset-password', [NewPasswordController::class, 'store']);
});

