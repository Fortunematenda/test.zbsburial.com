<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Auth\PasswordController;
use App\Helpers\RatingHelper;

/*
|--------------------------------------------------------------------------
| USER & PROFILE ROUTES
|--------------------------------------------------------------------------
| Routes for user profile management, dashboard, authentication, and settings
| All routes require Sanctum authentication unless otherwise noted
*/

/*
|--------------------------------------------------------------------------
| DASHBOARD (MOBILE) - REAL DATA, NO MOCKS
|--------------------------------------------------------------------------
*/
Route::get('/dashboard', function (Request $request) {
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
                // Use the same logic as /available-leads endpoint to get accurate count
                // This ensures dashboard count matches what users see in Leads tab
                // getLeads() uses havingRaw for distance filtering, which matches the Leads screen
                $leadsData = $profileController->getLeads($user, 1, 1, 0, 0, 0);
                $availableLeads = $leadsData['total'] ?? 0;
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
                // Count only hired leads (leads where contacted_lead status is 'Hired')
                $completedJobs = \App\Models\ContactedLeadsModel::join('leads', 'contacted_lead.lead_id', '=', 'leads.id')
                    ->where('leads.user_id', $user->id)
                    ->where('contacted_lead.status', 'Hired')
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
})->middleware('auth:sanctum');

/*
|--------------------------------------------------------------------------
| PROFILE (single endpoint for mobile)
|--------------------------------------------------------------------------
*/
Route::get('/user/profile', function (Request $request) {
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
})->middleware('auth:sanctum');

/*
|--------------------------------------------------------------------------
| USER LOCATION UPDATE (mobile)
|--------------------------------------------------------------------------
*/
Route::post('/user/location', function (Request $request) {
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
})->middleware('auth:sanctum');

/*
|--------------------------------------------------------------------------
| USER SERVICES UPDATE (mobile)
|--------------------------------------------------------------------------
*/
Route::post('/user/services', function (Request $request) {
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
})->middleware('auth:sanctum');

/*
|--------------------------------------------------------------------------
| USER AVATAR UPLOAD (mobile)
|--------------------------------------------------------------------------
*/
Route::post('/user/avatar', function (Request $request) {
    Log::info('🚀 [AVATAR UPLOAD] Upload request received');
    
    try {
        $user = $request->user();
        if (!$user) {
            Log::warning('❌ [AVATAR UPLOAD] User not authenticated');
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated'
            ], 401);
        }
        
        Log::info('✅ [AVATAR UPLOAD] User authenticated', ['user_id' => $user->id, 'email' => $user->email]);

        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg|max:2048',
        ]);
        
        Log::info('✅ [AVATAR UPLOAD] Validation passed');

        // Store uploaded avatar
        try {
            Log::info('📤 [AVATAR UPLOAD] Starting file storage...');
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
            $fileName = basename($avatarPath);
            Log::info('✅ [AVATAR UPLOAD] File stored', ['path' => $avatarPath, 'filename' => $fileName]);
            
            // Since public/storage is a regular directory (not symlink), also copy to public/storage/avatars
            $sourcePath = Storage::disk('public')->path($avatarPath);
            $destinationDir = public_path('storage/avatars');
            $destinationPath = $destinationDir . '/' . $fileName;
            
            Log::info('📁 [AVATAR UPLOAD] Paths determined', [
                'source' => $sourcePath,
                'destination_dir' => $destinationDir,
                'destination' => $destinationPath
            ]);
            
            // Ensure the avatars directory exists in public/storage
            if (!is_dir($destinationDir)) {
                Log::info('📁 [AVATAR UPLOAD] Creating destination directory...');
                if (!mkdir($destinationDir, 0755, true)) {
                    Log::error('❌ [AVATAR UPLOAD] Failed to create directory', ['dir' => $destinationDir]);
                    throw new \Exception("Failed to create directory: {$destinationDir}");
                }
                Log::info('✅ [AVATAR UPLOAD] Destination directory created');
            } else {
                Log::info('✅ [AVATAR UPLOAD] Destination directory exists');
            }
            
            // Verify source file exists
            Log::info('🔍 [AVATAR UPLOAD] Checking if source file exists...');
            if (!file_exists($sourcePath)) {
                Log::error('❌ [AVATAR UPLOAD] Source file does not exist', ['path' => $sourcePath]);
                throw new \Exception("Source avatar file does not exist: {$sourcePath}");
            }
            
            $sourceFileSize = filesize($sourcePath);
            Log::info('✅ [AVATAR UPLOAD] Source file exists', ['path' => $sourcePath, 'size' => $sourceFileSize . ' bytes']);
            
            // Copy the file to public/storage/avatars so it's accessible via web
            // This is REQUIRED - if copy fails, the upload must fail
            Log::info('📋 [AVATAR UPLOAD] Copying file to public storage...');
            if (!copy($sourcePath, $destinationPath)) {
                $error = error_get_last();
                Log::error('❌ [AVATAR UPLOAD] File copy failed', [
                    'source' => $sourcePath,
                    'destination' => $destinationPath,
                    'error' => $error
                ]);
                throw new \Exception("Failed to copy avatar to public storage. Error: " . ($error['message'] ?? 'Unknown error'));
            }
            Log::info('✅ [AVATAR UPLOAD] File copied successfully');
            
            // Verify the copy was successful
            Log::info('🔍 [AVATAR UPLOAD] Verifying copied file exists...');
            if (!file_exists($destinationPath)) {
                Log::error('❌ [AVATAR UPLOAD] Copied file verification failed', ['path' => $destinationPath]);
                throw new \Exception("Avatar file was not copied successfully to: {$destinationPath}");
            }
            
            $destinationFileSize = filesize($destinationPath);
            Log::info('✅ [AVATAR UPLOAD] Copied file verified', [
                'path' => $destinationPath,
                'size' => $destinationFileSize . ' bytes'
            ]);
            
            Log::info("✅ [AVATAR UPLOAD] Avatar uploaded and copied successfully", [
                'user_id' => $user->id,
                'source' => $sourcePath,
                'destination' => $destinationPath,
                'source_size' => $sourceFileSize,
                'destination_size' => $destinationFileSize
            ]);
        } catch (\Throwable $e) {
            Log::error("❌ [AVATAR UPLOAD] Failed to store avatar", [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            // Clean up: delete source file if it exists
            if (isset($avatarPath) && Storage::disk('public')->exists($avatarPath)) {
                Log::info('🧹 [AVATAR UPLOAD] Cleaning up source file after error...');
                Storage::disk('public')->delete($avatarPath);
            }
            throw $e;
        }
        
        // Get base URL - use the public/storage path for web access
        $baseUrl = $request->getSchemeAndHttpHost();
        $avatarUrl = $baseUrl . '/storage/avatars/' . $fileName;
        Log::info('🌐 [AVATAR UPLOAD] Avatar URL generated', ['url' => $avatarUrl, 'base_url' => $baseUrl]);

        // Update user's profile picture
        try {
            Log::info('💾 [AVATAR UPLOAD] Updating database...');
            $user->update([
                'profile_picture' => $avatarUrl,
            ]);
            Log::info('✅ [AVATAR UPLOAD] Database updated successfully');
        } catch (\Throwable $e) {
            Log::error("❌ [AVATAR UPLOAD] Failed to update profile picture in database", [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            // Delete the uploaded file from both locations if database update fails
            Log::info('🧹 [AVATAR UPLOAD] Cleaning up files after database error...');
            Storage::disk('public')->delete($avatarPath);
            $publicFilePath = public_path('storage/avatars/' . $fileName);
            if (file_exists($publicFilePath)) {
                unlink($publicFilePath);
            }
            throw $e;
        }

        Log::info('✅ [AVATAR UPLOAD] Upload process completed successfully', [
            'user_id' => $user->id,
            'avatar_url' => $avatarUrl
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Profile picture updated successfully',
            'data' => [
                'profile_picture' => $avatarUrl
            ]
        ]);
    } catch (\Illuminate\Validation\ValidationException $e) {
        Log::warning('❌ [AVATAR UPLOAD] Validation failed', ['errors' => $e->errors()]);
        return response()->json([
            'success' => false,
            'message' => 'Validation failed',
            'errors' => $e->errors()
        ], 422);
    } catch (\Throwable $e) {
        Log::error('❌ [AVATAR UPLOAD] Unexpected error', [
            'error' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'trace' => $e->getTraceAsString()
        ]);
        return response()->json([
            'success' => false,
            'message' => 'Failed to upload avatar: ' . $e->getMessage()
        ], 500);
    }
})->middleware('auth:sanctum');

/*
|--------------------------------------------------------------------------
| Change Password (mobile)
|--------------------------------------------------------------------------
*/
Route::put('/user/password', function (Request $request) {
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
})->middleware('auth:sanctum');

/*
|--------------------------------------------------------------------------
| FICA upload (mobile) - use helper auth
|--------------------------------------------------------------------------
*/
Route::post('/verify-fica', function (Request $request) {
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
})->middleware('auth:sanctum');

/*
|--------------------------------------------------------------------------
| GET USER (simple endpoint)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

/*
|--------------------------------------------------------------------------
| LOGOUT (manual – using token from header)
|--------------------------------------------------------------------------
*/
Route::post('/logout', function (Request $request) {
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
|--------------------------------------------------------------------------
| PORTFOLIO MANAGEMENT (mobile)
|--------------------------------------------------------------------------
*/
Route::get('/user/portfolio', function (Request $request) {
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
})->middleware('auth:sanctum');

Route::post('/user/portfolio', function (Request $request) {
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
            Log::error("Failed to store portfolio image", [
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
            Log::error("Failed to create portfolio item", [
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
})->middleware('auth:sanctum');

Route::delete('/user/portfolio/{id}', function (Request $request, $id) {
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
})->middleware('auth:sanctum');

/*
|--------------------------------------------------------------------------
| GET EXPERT/PROVIDER PROFILE (mobile) - for customers to view
|--------------------------------------------------------------------------
*/
Route::get('/expert-profile/{expertId}', function (Request $request, $expertId) {
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
})->middleware('auth:sanctum');

/*
|--------------------------------------------------------------------------
| WEB USER ROUTES (for web interface)
|--------------------------------------------------------------------------
| These routes are used by the web interface and require authentication
*/
Route::middleware('auth:sanctum')->group(function () {
    // user profile full (web)
    Route::prefix('user')->group(function () {
        Route::get('profile', [ProfileController::class, 'getProfile']);
        Route::put('profile', [ProfileController::class, 'updateProfile']);
        Route::put('change-password', [PasswordController::class, 'update']);
    });
});

