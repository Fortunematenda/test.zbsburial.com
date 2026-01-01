<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use App\Models\User;
use App\Models\ContactedLeadsModel;
use App\Models\CreditsTrailModel;
use App\Http\Controllers\LeadsController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\ProfileController;
use App\Helpers\DateHelper;
use App\Helpers\ContactHelper;
use App\Helpers\CacheHelper;
use App\Helpers\ImageValidationHelper;
use App\Http\Requests\CreateLeadRequest;
use App\Services\StructuredLogService;

/*
|--------------------------------------------------------------------------
| LEAD ROUTES
|--------------------------------------------------------------------------
| Routes for lead creation, management, messaging, and status updates
| All routes require Sanctum authentication unless otherwise noted
*/

/*
|--------------------------------------------------------------------------
| LEAD CREATION (MOBILE) - REQUIRES AUTHENTICATION
|--------------------------------------------------------------------------
| Requires Sanctum authentication. All clients must use Sanctum tokens.
*/
// Rate limited to prevent spam - 20 leads per minute
Route::post('/leads', function (CreateLeadRequest $request) {
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
})->middleware('auth:sanctum');

/*
|--------------------------------------------------------------------------
| MOBILE: AVAILABLE LEADS (same logic as desktop)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->get('/available-leads', function (Request $request) {
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
});

/*
|--------------------------------------------------------------------------
| MOBILE: USER RESPONSES (for your React Native screen)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->get('/user-responses', function (Request $request) {
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
});

/*
|--------------------------------------------------------------------------
| UPDATE CONTACTED LEAD STATUS (mobile)
|--------------------------------------------------------------------------
*/
Route::post('/update-contact-status', function (Request $request) {
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
})->middleware('auth:sanctum');

/*
|--------------------------------------------------------------------------
| MOBILE: USER REQUESTS (customer's own leads)
|--------------------------------------------------------------------------
*/
Route::get('/user-requests', function (Request $request) {
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
})->middleware('auth:sanctum');

/*
|--------------------------------------------------------------------------
| LEAD DETAILS (mobile) – unified auth
|--------------------------------------------------------------------------
*/
Route::get('/lead-details/{id}', function (Request $request, $id) {
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
})->middleware('auth:sanctum');

/*
|--------------------------------------------------------------------------
| GET CUSTOMER CONVERSATIONS GROUPED BY REQUEST (mobile)
|--------------------------------------------------------------------------
*/
Route::get('/customer-conversations', function (Request $request) {
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
})->middleware('auth:sanctum');

/*
|--------------------------------------------------------------------------
| GET MESSAGES FOR A SPECIFIC CONVERSATION (mobile)
|--------------------------------------------------------------------------
*/
Route::get('/lead-notes/{leadId}/{providerId}', function (Request $request, $leadId, $providerId) {
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
})->middleware('auth:sanctum');

/*
|--------------------------------------------------------------------------
| SEND MESSAGE IN CONVERSATION (mobile)
|--------------------------------------------------------------------------
*/
Route::post('/send-message', function (Request $request) {
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
})->middleware('auth:sanctum');

/*
|--------------------------------------------------------------------------
| CONTACT LEAD (mobile) – with credit check
|--------------------------------------------------------------------------
*/
Route::post('/contact-lead', function (Request $request) {
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
})->middleware('auth:sanctum');

/*
|--------------------------------------------------------------------------
| UNLOCK CUSTOMER INFO (mobile)
|--------------------------------------------------------------------------
*/
Route::post('/unlock-customer-info', function (Request $request) {
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
})->middleware('auth:sanctum');

/*
|--------------------------------------------------------------------------
| GET CHAT MESSAGES (mobile)
|--------------------------------------------------------------------------
*/
Route::get('/chat-messages/{leadId}', function (Request $request, $leadId) {
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
| MOBILE - LEAD STATUS MANAGEMENT
|--------------------------------------------------------------------------
*/
// Get experts who responded to a lead (for "hired someone" selection)
Route::get('/mobile/lead/{id}/experts', function (Request $request, $id) {
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
})->middleware('auth:sanctum');

// Update lead status (close request or mark as hired)
Route::post('/mobile/lead/{id}/update-status', function (Request $request, $id) {
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
})->middleware('auth:sanctum');

/*
|--------------------------------------------------------------------------
| WEB LEADS ROUTES (for web interface)
|--------------------------------------------------------------------------
| These routes are used by the web interface and require authentication
*/
Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('leads')->group(function () {
        Route::get('/', [LeadsController::class, 'getUserLeads']);
        Route::get('my', [CustomerController::class, 'getMyLeads']);
        Route::get('available', [LeadsController::class, 'getAvailableLeads']);
        Route::get('{id}', [LeadsController::class, 'getLeadDetails']);
        // Remove createLead route as it's not designed for direct routing
        // use the /leads endpoint defined earlier at line 673
        Route::put('{id}', [LeadsController::class, 'updateLead']);
        Route::delete('{id}', [LeadsController::class, 'deleteLead']);
        Route::post('{id}/contact', [LeadsController::class, 'contactLead']);
    });
});

