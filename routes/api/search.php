<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Log;

/*
|--------------------------------------------------------------------------
| SEARCH ROUTES
|--------------------------------------------------------------------------
| Routes for global search functionality
| All routes require Sanctum authentication
*/

/*
|--------------------------------------------------------------------------
| MOBILE - GLOBAL SEARCH
|--------------------------------------------------------------------------
*/
Route::get('/mobile/search', function (Request $request) {
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
})->middleware('auth:sanctum');

