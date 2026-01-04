<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\View\View;
use App\Models\ServicesModel;
use App\Models\UserServicesModel;
use App\Models\ImagesModel;
use App\Models\LeadsModel;
use App\Models\ContactedLeadsModel;
use App\Models\User;
use App\Models\CreditsTrailModel;
use App\Models\Otp;
use App\Notifications\SendOtpNotification;
use App\Services\ExpoPushNotification;
use App\Helpers\DistanceHelper;
use Carbon\Carbon;
use Exception;

class ProfileController extends Controller
{
    public function getProfile(Request $request)
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }
            
            // Refresh user to get absolutely fresh data from database
            $user->refresh();
            
            // Get user's services
            $userServices = \App\Models\UserServicesModel::where('user_id', $user->id)
                ->pluck('service_id')
                ->map(fn($id) => (int)$id)
                ->toArray();
            
            // Calculate rating based on role
            $rating = null;
            if ($user->role === 'Customer') {
                $rating = \App\Helpers\RatingHelper::calculateCustomerRating($user->id);
            } elseif ($user->role === 'Expert') {
                // Calculate expert rating from customer reviews
                $reviews = \App\Models\RatingsModel::where('to_user_id', $user->id)->get();
                $avgRating = $reviews->avg('rating');
                $rating = $avgRating ? round($avgRating, 1) : 0;
            }
            
            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $user->id,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'contact_number' => $user->contact_number,
                    'location' => $user->location,
                    'zip_code' => $user->zip_code,
                    'latitude' => $user->latitude,
                    'longitude' => $user->longitude,
                    'distance' => $user->distance,
                    'company_name' => $user->company_name,
                    'is_company_website' => $user->is_company_website,
                    'company_size' => $user->company_size,
                    'is_company_sales_team' => $user->is_company_sales_team,
                    'is_company_social_media' => $user->is_company_social_media,
                    'biography' => $user->biography,
                    'id_upload' => $user->id_upload,
                    'self_upload' => $user->self_upload,
                    'fica_verified' => (bool)($user->fica_verified ?? false),
                    'verified_by' => $user->verified_by,
                    'date_uploaded' => $user->date_uploaded,
                    'date_verified' => $user->date_verified,
                    'credits_balance' => $user->credits_balance ?? 0,
                    'profile_picture' => $user->profile_picture,
                    'services' => $userServices,
                    'created_at' => $user->created_at,
                    'updated_at' => $user->updated_at,
                    'rating' => $rating
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get user profile: ' . $e->getMessage()
            ], 500);
        }
    }

    public function updateProfile(Request $request)
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            $request->validate([
                'first_name' => 'sometimes|required|string|max:255',
                'last_name' => 'sometimes|required|string|max:255',
                'email' => 'sometimes|required|string|email|max:255|unique:users,email,' . $user->id,
                'contact_number' => 'sometimes|required|string|max:20',
                'location' => 'sometimes|required|string|max:255',
                'zip_code' => 'nullable|string|max:20',
                'latitude' => 'nullable|string|max:20',
                'longitude' => 'nullable|string|max:20',
                'distance' => 'nullable|string|in:10,20,50,0',
                'company_name' => 'nullable|string|max:255',
                'biography' => 'nullable|string|max:1000',
            ]);

            $user->update($request->only([
                'first_name', 'last_name', 'email', 'contact_number', 
                'location', 'zip_code', 'latitude', 'longitude', 
                'distance', 'company_name', 'biography'
            ]));

            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully',
                'data' => [
                    'id' => $user->id,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'contact_number' => $user->contact_number,
                    'location' => $user->location,
                    'zip_code' => $user->zip_code,
                    'latitude' => $user->latitude,
                    'longitude' => $user->longitude,
                    'distance' => $user->distance,
                    'company_name' => $user->company_name,
                    'is_company_website' => $user->is_company_website,
                    'company_size' => $user->company_size,
                    'is_company_sales_team' => $user->is_company_sales_team,
                    'is_company_social_media' => $user->is_company_social_media,
                    'biography' => $user->biography,
                    'id_upload' => $user->id_upload,
                    'self_upload' => $user->self_upload,
                    'fica_verified' => !empty($user->id_upload) && !empty($user->self_upload),
                    'credits_balance' => $user->credits_balance ?? 0,
                    'created_at' => $user->created_at,
                    'updated_at' => $user->updated_at
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update profile: ' . $e->getMessage()
            ], 500);
        }
    }
  
     public function openDashboard(Request $request)
     {
        $user = Auth::user();
        session(['temp_role' => "Expert"]);
        $user = $request->user();
        $first_name = $user->first_name;
        $email = $user->email;
        $logo = $user->logo;
        $profile_picture = $user->profile_picture;
        $subscribed_services_notifications = $user->subscribed_services_notifications;
        $new_leads_notifications = $user->new_leads_notifications;
        $weekly_newsletter_notifications = $user->weekly_newsletter_notifications;
        $sms_notifications = $user->sms_notifications;
        $contact_number=$user->contact_number;
        $is_company_website=$user->is_company_website;
        $biography=$user->biography;
        $company_size=$user->company_size;
        $is_company_sales_team=$user->is_company_sales_team;
        $location=$user->location;
        $company_name = $user->company_name;
        $company_registration_number = $user->company_registration_number;
        $credits_balance = $user->credits_balance;
        $timestamp = strtotime($user->login_at);
        $greetings = $this->greetings();
        $login_at = date('l, j M g:ia', $timestamp);
        $latest_services = $this->getUserServices($user->id);
        $latest_services_limited = array_slice($latest_services, 0, 2);
        $number_of_leads = $this->getLeadsCount($user);
        $contacted_lead = $this->getResponseLeadsCount($user->id);
        $contacted_hired = $this->getResponseLeadsCount($user->id,2);
        $service_badge = count($latest_services)-2;
        $unread_leads = $this->getUnreadLeads($user);
        $perc = $this->profileProgress($user);
        $latestresponse = $this->getLatestResponse($user);
        return view("dashboard",compact(["first_name","login_at","perc","contacted_lead","latestresponse","contacted_hired","greetings","profile_picture","contact_number","company_name","is_company_website","company_size","is_company_sales_team","logo","location","company_registration_number","latest_services_limited","service_badge","email","number_of_leads","unread_leads","credits_balance","new_leads_notifications","weekly_newsletter_notifications","subscribed_services_notifications","sms_notifications","biography"]));
     }
     public function edit(Request $request): View
     {
         $user = $request->user();
         $services = ServicesModel::pluck('service_name')->toArray();
         $latest_services = $this->getUserServices($user->id);
         $transactions = $this->getCreditHistory($user->id);

         $customer = new CustomerController();
         $images = $customer->getImages($user->id);
         $reviews = $customer->getReviews($user->id);
     //print_r($images);
         return view('profile.edit', [
             'user' => $user,
             'services' => $services,
             'company_name' => $user->company_name,
             'is_company_website' => $user->is_company_website,
             'company_size' => $user->company_size,
             'is_company_sales_team' => $user->is_company_sales_team,
             'contact_number' => $user->contact_number,
             'company_registration_number' => $user->company_registration_number,
             'biography' => $user->biography,
             'location'=>$user->location,
             'latitude'=>$user->latitude,
             'longitude'=>$user->longitude,
             'distance'=>$user->distance,
             'latest_services' => $latest_services,
             'profile_picture' =>$user->profile_picture,
             'logo' =>$user->logo,
             'transactions'=>$transactions,
             'credits_balance'=>$user->credits_balance,
             'images'=>$images,
             'reviews'=>$reviews,
             
         ]);
     }
     

     public function update(ProfileUpdateRequest $request): RedirectResponse
{
    $user = $request->user();
  try{
    // Handle profile picture upload
    if ($request->hasFile('profile_picture')) {
        // Store the image in the 'public/profile_pictures' directory
        $path = $request->file('profile_picture')->store('profile_pictures', 'public');
        $imageName = basename($path);
        
    }

    // Fill in other user data from validated request
    $user->fill($request->validated());
    if ($user->isDirty('email')) {
        $user->email_verified_at = null; // Reset verification if email has changed
    }
    if ($request->filled('latitude') && $request->filled('longitude')) {
        $user->latitude = $request->latitude;
        $user->longitude = $request->longitude;
    }
    if ($request->filled('distance')) {
        $user->distance = $request->distance;
    }

    if ($request->filled('biography')) {
        $user->biography = $request->input('biography');
    }

    if ($user->isDirty()) {
   
        if ($request->hasFile('profile_picture')) {
          
        $user->profile_picture = $imageName;
        }
        $user->save(); 
        if($user->role =="Expert")
        {
            return redirect()->route('profile.edit')->with('status', 'profile-updated')->with('success', 'Profile updated successfully!');
        }
        else{
            return redirect()->route('customersettings')->with('status', 'profile-updated')->with('success', 'Profile updated successfully!');
        }
        
    }
    if($user->role =="Expert")
    {
        return redirect()->route('profile.edit')->with('status', 'profile-updated')->with('success', 'Profile updated successfully!');
    }
    else{
        return redirect()->route('customersettings')->with('status', 'profile-updated')->with('success', 'Profile updated successfully!');
    }
}
catch(Exception $e)
{
    return redirect()->route('profile.edit')->with('status', 'profile-updated')->with('error', 'No changes were made : '.$e->getMessage());
}

    
}



     

    public function updateServices(Request $request): RedirectResponse
    {
    
        $user = $request->user();
        UserServicesModel::where('user_id', $user->id)->delete();
        $services = $request->services;
        for($i=0; $i<count($services);$i++)
        {
            if($i>4)
            {
                break;
            }
            $service = $services[$i];
            $id = $this->getServiceID($service);
            $service = UserServicesModel::create(['user_id'=>$user->id, 'service_id'=>$id, 'entered_by'=>$user->id]);

        }
        $latest_services = $this->getUserServices($user->id);

        return Redirect::route('profile.edit')->with('latest_services', $latest_services);
    }
    
    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validateWithBag('userDeletion', [
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
    public function createProfession(Request $request)
    {
        return view("profile.create-profession");
    }
    public function createAccountProfession(Request $request)
    {
        return view("profile.create-account-profession");
    }
    private function getServiceID($service_name):int
    {
        $id = ServicesModel::where('service_name', $service_name)->pluck('id')->first();
        return (int)$id;
    }
    private function greetings()
{
    $current_hour = (int)date('H') + 2;

    if ($current_hour >= 5 && $current_hour < 12) {
        return 'Good morning';
    } elseif ($current_hour >= 12 && $current_hour < 17) {
        return 'Good afternoon';
    } elseif ($current_hour >= 17 && $current_hour < 21) {
        return 'Good evening';
    } else {
        return 'Good night';
    }



    }
    public function getUserServices($user_id){
        $latest_services = UserServicesModel::where('user_id', $user_id)->join('master_services', 'user_services.service_id', '=', 'master_services.id')
        ->pluck('master_services.service_name')
        ->toArray();
        return $latest_services;
    }
    public function getLeadsCount($user, $filter = 0)
{
    $user_id = $user->id;
    // Use DistanceHelper to generate distance calculation SQL
    $distanceSql = DistanceHelper::getDistanceSql(
        $user->latitude,
        $user->longitude,
        'leads.latitude',
        'leads.longitude'
    );
    
    $urgentTotal = LeadsModel::join('user_services as u', 'leads.service_id', '=', 'u.service_id')
        ->join('master_services as m', 'u.service_id', '=', 'm.id')
        ->join('users as s', 'leads.user_id', '=', 's.id')
        ->select('leads.*')
        ->selectRaw($distanceSql)
        ->where('u.user_id', $user_id)
        ->where('leads.status', '=', 'Open');

    // Apply filter conditionally
    if ($filter == 1) {
        $urgentTotal->whereNotIn('leads.id', function ($query) {
            $query->select('lead_id')
                  ->from('contacted_lead');
        });
    } elseif ($filter == 2) {
        $urgentTotal->where('leads.urgent', '=', 1);
    }

    $urgentTotal->whereNotIn('leads.id', function ($query) use ($user_id) {
            $query->select('lead_id')
                  ->from('contacted_lead')
                  ->where('user_id', $user_id);
        });
    
    // If distance is 0 (Unlimited), don't apply distance filter - show all leads nationwide
    $distance = (float) $user->distance;
    if ($distance > 0) {
        // Use DistanceHelper to generate distance filter SQL
        $distanceFilterSql = DistanceHelper::getDistanceFilterSql(
            $user->latitude,
            $user->longitude,
            $user->distance,
            'leads.latitude',
            'leads.longitude'
        );
        $urgentTotal->whereRaw($distanceFilterSql);
    }
    // If distance is 0, no distance filter is applied - all leads nationwide are shown

    return $urgentTotal->count();
}

    public function getLeads($user, $page=0,$perPage=0,$offset=0,$filter=0, $sortdistance=0)
    {
        $user_id = $user->id;
        
        // Use DistanceHelper to generate distance calculation SQL
        // Only calculate distance if user has valid coordinates
        $selectFields = [
            'm.service_name', 
            'leads.user_id as lead_user_id',  
            'leads.service_id', 
            's.first_name', 
            's.last_name', 
            'leads.date_entered', 
            'leads.id', 
            'leads.description', 
            'leads.location',
            's.is_phone_verified',
            'leads.urgent',
            'leads.credits',
            'leads.hiring_decision',
        ];
        
        // Only add distance calculation if user has valid coordinates
        if ($user->latitude !== null && $user->longitude !== null && 
            is_numeric($user->latitude) && is_numeric($user->longitude)) {
            $distanceSql = DistanceHelper::getDistanceSql(
                (float) $user->latitude,
                (float) $user->longitude,
                'leads.latitude',
                'leads.longitude'
            );
            $selectFields[] = DB::raw($distanceSql);
        } else {
            // If no coordinates, set distance to null
            $selectFields[] = DB::raw('NULL AS distance');
        }
        
        $query = LeadsModel::join('user_services as u', 'leads.service_id', '=', 'u.service_id')
    ->join('master_services as m', 'u.service_id', '=', 'm.id')
    ->join('users as s', 'leads.user_id', '=', 's.id')
    ->select($selectFields)
    ->where('u.user_id', $user_id)
    ->where('leads.status', '=', 'Open')
    ->whereNotIn('leads.id', function ($query) use ($user_id) {
        $query->select('lead_id')
              ->from('contacted_lead')
              ->where('user_id', $user_id);
    });
      // Apply filter conditionally
      if ($filter == 1)
      {
        $query->whereNotIn('leads.id', function ($query)  {
            $query->select('lead_id')
                  ->from('contacted_lead');
        });
      }
      elseif ($filter == 2) {
        $query->where('leads.urgent', '=', 1);
    }
   
    // Validate and sanitize distance value to prevent SQL injection
    $distance = (float) $user->distance;
    // If distance is 0 (Unlimited), don't apply distance filter - show all leads nationwide
    if ($distance > 0) {
        // Ensure distance is within valid range (10, 20, or 50 km) - default to 20 if invalid
        if (!in_array($distance, [10, 20, 50], true)) {
            $distance = 20.0; // Default safe value
        }
        $query->havingRaw('distance <= ?', [$distance]);  // Use parameter binding for security
    }
    // If distance is 0, no distance filter is applied - all leads nationwide are shown
    if($sortdistance == 1)
    {
        $query->orderBy('distance', 'asc');
    }
    else{
        $query->orderBy('leads.id', 'desc');
    }
    
    $countQuery = clone $query;
        $total = $countQuery->count();

        // Apply limit and offset for pagination
        $leads = $query->skip($offset)->take($perPage)->get();

        // Return JSON response
        return [
            'data' => $leads,
            'current_page' => $page,
            'per_page' => $perPage,
            'total' => $total,
            'last_page' => ceil($total / $perPage)
        ];
    
    }
    public function getResponseLeadsCount($user_id,$filter=0)
    {
        $query = ContactedLeadsModel::join('leads as u', 'contacted_lead.lead_id', '=', 'u.id')
        ->join('master_services as m', 'u.service_id', '=', 'm.id')
        ->join('users as s', 'u.user_id', '=', 's.id')            
        ->where('contacted_lead.user_id', $user_id)  
        ->where('contacted_lead.status', '<>',"Not Interested");
        if($filter == 1)  
        {
$query->where('contacted_lead.status', '=',"Pending");
        } 
        elseif($filter == 2) 
        {
            $query->where('contacted_lead.status', '=',"Hired");
        }
        return $query->count();
    
    }
    public function getResponseLeads($user_id, $page=0,$perPage=0,$offset=0,$filter=0)
    {
        $query = ContactedLeadsModel::join('leads as u', 'contacted_lead.lead_id', '=', 'u.id')
    ->join('master_services as m', 'u.service_id', '=', 'm.id')
    ->join('users as s', 'u.user_id', '=', 's.id')
    ->leftJoin(DB::raw('(SELECT lead_id, MAX(date_entered) as latest_date_entered FROM lead_notes GROUP BY lead_id) as ln'), 'u.id', '=', 'ln.lead_id')
    ->leftJoin('lead_notes as ln_full', function($join) {
        $join->on('ln.lead_id', '=', 'ln_full.lead_id')
             ->on('ln.latest_date_entered', '=', 'ln_full.date_entered');
    })
    ->select(
        'm.service_name', 
        'u.user_id as lead_user_id', 
        'u.user_id as user_service_user_id', 
        's.id as loggedin_user_id',
        'u.service_id', 
        's.first_name', 
        's.last_name', 
        'u.date_entered', 
        'contacted_lead.date_entered as contacted_date',
        'u.id', 
        'u.description', 
        'u.location',
        's.is_phone_verified',
        'u.urgent',
        'u.credits',
        'u.hiring_decision',
        'contacted_lead.status as contacted_status',
        'ln_full.date_entered as latest_note_date',
    )
    ->where('contacted_lead.user_id', $user_id)
    ->where('contacted_lead.status', '<>', "Not Interested");

if ($filter == 1) {  
    $query->where('contacted_lead.status', '=', "Pending");
} elseif ($filter == 2) {  
    $query->where('contacted_lead.status', '=', "Hired");
}

// Sort by lead date descending (newest first)
$query->orderBy('u.date_entered', 'desc');

        $countQuery = clone $query;
        $total = $countQuery->count();

        // Apply limit and offset for pagination
        $leads = $query->skip($offset)->take($perPage)->get();

        // Return JSON response
        return [
            'data' => $leads,
            'current_page' => $page,
            'per_page' => $perPage,
            'total' => $total,
            'last_page' => ceil($total / $perPage)
        ];
    
    return $results;
    
    }
    public function getIndividualLead($lead_id)
    {
        $results = LeadsModel::join('user_services as u', 'leads.service_id', '=', 'u.service_id')
        ->join('master_services as m', 'u.service_id', '=', 'm.id')
        ->join('users as s', 'leads.user_id', '=', 's.id')
        ->select(
            'm.service_name', 
            'leads.user_id as lead_user_id', 
            'u.user_id as user_service_user_id', 
            'leads.service_id', 
            's.first_name', 
            's.last_name', 
            'leads.date_entered', 
            'leads.id', 
            'leads.description', 
            'leads.location',
            's.is_phone_verified',
            'leads.urgent',
            'leads.credits',
            's.email',
            's.contact_number',
            'leads.status',
            'leads.hiring_decision'
        )
        ->where('leads.id', $lead_id)
        ->first();
    
    return $results;
    
    }

    private function getUnreadLeads($user)
    {
        // Use DistanceHelper to generate distance calculation SQL
        $distanceSql = DistanceHelper::getDistanceSql(
            $user->latitude,
            $user->longitude,
            'leads.latitude',
            'leads.longitude'
        );
        
        // Validate and sanitize distance value to prevent SQL injection
        $distance = (float) $user->distance;
        
        $query = LeadsModel::join('user_services as u', 'leads.service_id', '=', 'u.service_id')
        ->join('master_services as m', 'u.service_id', '=', 'm.id')
        ->join('users as s', 'leads.user_id', '=', 's.id')
        ->select('m.service_name', 'leads.user_id as lead_user_id', 'u.user_id as user_service_user_id', 'leads.service_id', 'leads.id')
        ->selectRaw($distanceSql)
        ->where('u.user_id', $user->id)
        ->where('leads.status', '=', 'Open')
        ->where('u.user_id', $user->id)
        ->whereNotIn('leads.id', function ($query) use ($user) {
            $query->select('lead_id')
                  ->from('leads_read')
                  ->where('user_id', $user->id);
        });
        
        // If distance is 0 (Unlimited), don't apply distance filter - show all leads nationwide
        if ($distance > 0) {
            // Ensure distance is within valid range (10, 20, or 50 km) - default to 20 if invalid
            if (!in_array($distance, [10, 20, 50], true)) {
                $distance = 20.0; // Default safe value
            }
            $query->havingRaw('distance <= ?', [$distance]);  // Use parameter binding for security
        }
        // If distance is 0, no distance filter is applied - all leads nationwide are shown
        
        $results = $query->count();

    return $results;
    }

    private function getCreditHistory($userId)
    {
        // Retrieve user credit transactions
        return CreditsTrailModel::where('user_id', $userId) // Use the correct model name here
            ->orderBy('date_entered', 'desc')
            ->get();
    }

    public function transactionHistory()
    {
        $user = Auth::user();
        if (!$user) {
            abort(401, 'Unauthenticated');
        }

        $transactions = $this->getCreditHistory($user->id);
        return view('transaction-history', compact('transactions'));
    }

public function updateNotifications(Request $request)
{
    $user = Auth::user();

    // Validate the incoming request
    $request->validate([
        'subscribed_services_notifications' => 'nullable|boolean',
        'new_leads_notifications' => 'nullable|boolean',
        'weekly_newsletter_notifications' => 'nullable|boolean',
        'sms_notifications' => 'nullable|boolean',
    ]);

    // Update notification settings based on checkbox inputs
    User::where('id', $user->id)->update([
        'subscribed_services_notifications' => $request->has('subscribed_services_notifications'),
        'new_leads_notifications' => $request->has('new_leads_notifications'),
        'weekly_newsletter_notifications' => $request->has('weekly_newsletter_notifications'),
        'sms_notifications' => $request->has('sms_notifications'),
    ]);

    return response()->json(['status' => 'success', 'message' => 'Notification settings updated successfully.']);
}
public function subscribedNotifications(Request $request)
{
    $user = Auth::user();

    // Validation rules for incoming data
    $validatedData = $request->validate([
        'subscribed_services_notifications' => 'required|boolean',
        'new_leads_notifications' => 'required|boolean',
        'weekly_newsletter_notifications' => 'required|boolean',
        'sms_notifications' => 'required|boolean',
    ]);

    // Update the subscription settings
    User::where('id', $user->id)->update($validatedData);

    return response()->json(['status' => 'success', 'message' => 'Notification settings updated.']);
}

public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        // Register the user
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Generate OTP
        $otp = rand(100000, 999999);

        // Store OTP in session or database
        Session::put('otp', $otp);
        Session::put('otp_user_id', $user->id);

        // Send OTP to user via email
        $user->notify(new SendOtpNotification($otp));

        // Redirect to OTP verification view
        return redirect()->route('profile.verifyOtp');
    }

    // Show OTP verification form
    public function showOtpForm()
    {
        // Render the OTP view
        return view('auth.otp');
    }
    public function sendOtp(Request $request)
    {
        $otp = rand(100000, 999999); // Generate OTP

        // Store OTP in the database with expiration time (e.g., 5 minutes)
        Otp::create([
            'user_id' => Auth::id(),
            'otp' => $otp,
            'expires_at' => Carbon::now()->addMinutes(5), // Set expiration time
        ]);

        // Send OTP to the user via Email, SMS, etc.
        /** @var User $user */
        $user = Auth::user();
        $user->notify(new SendOtpNotification($otp));

        return response()->json(['message' => 'OTP sent successfully']);
    }


    public function verifyOtp(Request $request)
    {
        // Verify OTP logic here
        $otp = $request->input('otp');

        // You can store the OTP in the session or database for verification
        // Compare with the generated OTP here
        if ($otp == '123456') {
            return response()->json(['message' => 'OTP verified successfully']);
        }

        return response()->json(['message' => 'Invalid OTP'], 400);
    }

    
    public function leadsTrend(Request $request)
    {
        $user = $request->user();
    
        try {
            $leads = DB::table('leads as l')
                ->join('user_services as u', 'l.service_id', '=', 'u.service_id')
                ->join('master_services as m', 'u.service_id', '=', 'm.id')
                ->selectRaw('DATE_FORMAT(l.date_entered, "%Y-%m") as month, DATE_FORMAT(l.date_entered, "%b") as labels, COUNT(l.id) as data')
                ->where('u.user_id', $user->id)
                ->whereNotNull('l.date_entered') // Ensure no NULL values
                ->whereRaw('
                    (
                        6371 * acos(
                            cos(radians(?)) 
                            * cos(radians(l.latitude)) 
                            * cos(radians(l.longitude) - radians(?)) 
                            + sin(radians(?)) 
                            * sin(radians(l.latitude))
                        )
                    ) <= ?
                ', [$user->latitude, $user->longitude, $user->latitude, $user->distance])
                ->groupByRaw('DATE_FORMAT(l.date_entered, "%Y-%m"), DATE_FORMAT(l.date_entered, "%b")') // Include all selected fields
                ->orderBy('month', 'ASC')
                ->limit(12)
                ->get();
    
            return response()->json(["message" => "Success", "leads" => $leads], 200);
        } catch (Exception $e) {
            return response()->json(["message" => "Error", "error" => $e->getMessage()], 500);
        }
    }
    
    
    
    public function getLatestResponse($user){
        $lead = ContactedLeadsModel::join('leads as l', 'contacted_lead.lead_id', '=', 'l.id')
    ->join('master_services as m', 'l.service_id', '=', 'm.id')
    ->select('l.location', 'contacted_lead.date_entered', 'l.description', 'm.service_name')
    ->where('contacted_lead.status', 'Pending')
    ->where('contacted_lead.user_id', $user->id)
    ->orderByDesc('contacted_lead.id')
    ->first();
   return $lead;
    }
    private function profileProgress($user)
    {
        $registration_perc = 50;
        $profilepic_perc = $user->profile_picture !== null && $user->profile_picture !== '' ?20:0;
        $bio_perc =$user->biography !== null && $user->biography !== '' ?10:0;
        $social_perc =$user->twitter !== null && $user->twitter !== '' ?5:0;
        $social_perc +=$user->facebook !== null && $user->facebook !== '' ?5:0;
        $social_perc +=$user->linkedin !== null && $user->linkedin !== '' ?5:0;
        $social_perc +=$user->instagram !== null && $user->instagram !== '' ?5:0;

        $total = $registration_perc + $profilepic_perc + $bio_perc + $social_perc;

        return $total;

    }

    public function socialLink(Request $request)
    {
        $user = Auth::user();
        return view('social', compact('user'));
    }
    
    public function updateSocialLinks(Request $request)
{
    $user = Auth::user();
    
    // Validation rules for incoming data
    $validatedData = $request->validate([
        'facebook' => 'nullable|url',
        'twitter' => 'nullable|url',
        'linkedin' => 'nullable|url',
        'instagram' => 'nullable|url',
    ]);

    try {
       User::where('id',$user->id)->update([
            'facebook' => $validatedData['facebook'],
            'twitter' => $validatedData['twitter'],
            'linkedin' => $validatedData['linkedin'],
            'instagram' => $validatedData['instagram'],
        ]);
                
        return redirect()->route('profile.edit')->with('status', 'profile-updated')->with('success', 'Social links updated successfully!');
    } catch (\Exception $e) {
        // Handle exception and return error message
        
        return redirect()->route('profile.edit')->with('status', 'profile-updated')->with('error', 'Failed to update social links!');
    }
}

public function uploadPhotos(Request $request)
{
    try {
        $user = $request->user();
        $uploadedFiles = [];

        // Validate the request to ensure files are images and required
        $request->validate([
            'files.*' => 'required|image|mimes:jpeg,png,jpg,gif|max:4048', // 2MB limit per file
        ]);

        if (!$request->hasFile('files')) {
            return redirect()->route('profile.edit')
                ->with('status', 'upload_photos')
                ->with('error', 'No photos attached!');
        }

        // Handle file uploads
        $customer = new CustomerController();
        $images = $customer->getImages($user->id);
        if(count($images)>7)
        {
            return redirect()->route('profile.edit')
            ->with('status', 'limit_photos')
            ->with('error', 'Failed to upload, limit exeeded');
        }
        $files = is_array($request->file('files')) ? $request->file('files') : [$request->file('files')];
$cc=0;
        foreach ($files as $file) {
            if($cc>7)
            {
                break;
            }
            $path = $file->store('uploads', 'public');
            $uploadedFiles[] = $path;
            $imageName = basename($path);

            $customer->insertImages($imageName, "Profile", $user->id, $user->id, $user->id);
            $cc++;
        }
       
        return redirect()->route('profile.edit')
        ->with('status', 'upload_photos')
        ->with('success', 'Photos uploaded successfully!');
        

    } catch (\Exception $e) {
        return redirect()->route('profile.edit')
            ->with('status', 'upload_photos')
            ->with('error', 'Failed to upload photos6: ' . $e->getMessage());
    }
}

public function deletePhoto(Request $request)
{
    try {
        // Find the image by ID
        $image = ImagesModel::find($request->id);

        // Check if the image exists
        if (!$image) {
            return response()->json(["status" => "error", "message" => "Image not found"], 404);
        }

        // Delete the file from storage
        if (Storage::exists('public/uploads/' . $image->image_name)) {
            Storage::delete('public/uploads/' . $image->image_name);
        }

        // Delete the database record
        $image->delete();

        return response()->json([
            "status" => "success",
            "message" => "Image successfully deleted",
            "image_id" => $request->id
        ], 200);

    } catch (Exception $e) {
        return response()->json([
            "status" => "error",
            "message" => "There was an error deleting the image",
            "error" => $e->getMessage()
        ], 500);
    }



}


public function BecomeExpert(Request $request)
{
    
    $user = Auth::user();
    // Validation rules for incoming data
    $validatedData = $request->validate([
        'company_name' => 'required|string|max:255',
        'distance' => 'required|numeric', // If distance should be a number
        'is_company_website' => 'required|boolean', // If it’s a true/false value
        'company_size' => 'required', // If it should be an integer
        'biography' => 'required|string', // If it’s a free text field
    ]);
     $services = $request->services;
        for($i=0; $i<count($services);$i++)
        {
            if($i>4)
            {
                break;
            }
            $service = $services[$i];
            $id = $this->getServiceID($service);
            $service = UserServicesModel::create(['user_id'=>$user->id, 'service_id'=>$id, 'entered_by'=>$user->id]);

        }
    //return redirect()->route('customer.dashboard')->with('status', 'profile-updated')->with('success', 'Profile Successfully Updated!!!');
    try {
       User::where('id',$user->id)->update([
            'company_name' => $validatedData['company_name'],
            'distance' => $validatedData['distance'],
            'is_company_website' => $validatedData['is_company_website'],
            'company_size' => $validatedData['company_size'],
            'biography' => $validatedData['biography'],
            'role' => 'Expert',
        ]);
                
        return redirect()->route('customer.dashboard')->with('status', 'profile-updated')->with('success', 'Profile Successfully Updated!!!');
    } catch (\Exception $e) {
        // Handle exception and return error message
        
        return redirect()->route('customer.dashboard')->with('status', 'profile-updated')->with('error', 'Failed to update profile!');
    }
}
public function VerifyFica(Request $request)
{
    $user = $request->user();
    try {
        $user = $request->user();
        $uploadedFiles = [];

        // Validate the request to ensure files are images and required
        $request->validate([
            'idUpload' => 'required|image|mimes:jpeg,png,jpg,pdf|max:4048', // ID/Passport Upload
            'selfieUpload' => 'required|image|mimes:jpeg,png,jpg|max:4048', // Selfie Holding ID/Passport
        ]);

        if (!$request->hasFile('idUpload') || !$request->hasFile('selfieUpload')) {
            return redirect()->route('dashboard')
                ->with('status', 'upload_photos')
                ->with('error', 'Both ID/Passport and Selfie are required!');
        }

        // Store ID/Passport File
        $idFile = $request->file('idUpload');
        $idPath = $idFile->store('uploads/ids', 'public');
        $uploadedFiles['idUpload'] = basename($idPath);

        // Store Selfie Holding ID/Passport File
        $selfieFile = $request->file('selfieUpload');
        $selfiePath = $selfieFile->store('uploads/selfies', 'public');
        $uploadedFiles['selfieUpload'] = basename($selfiePath);

        User::where('id',$user->id)->update([
            'id_upload' =>$uploadedFiles['idUpload'],
            'self_upload' => $uploadedFiles['selfieUpload'],
            'date_uploaded' => date("Y-m-d H:i:s"),           
        ]);

        return redirect()->route('dashboard')
            ->with('status', 'upload_photos')
            ->with('success', 'FICA documents uploaded successfully!');
        
    } catch (\Exception $e) {
        return redirect()->route('dashboard')
            ->with('status', 'upload_photos')
            ->with('error', 'Failed to upload photos: ' . $e->getMessage());
    }
}


public function postToken(Request $request)
{
    try{
    $user = $request->user();
    $token = $request->token;
    User::where('id', $user->id)->update([
    'token' =>$token
    ]);
    return response()->json(["message"=>"Success"],200);
}
catch(Exception $e)
{
    return response()->json(["message"=>"There is an error"],500);
}
}

public function getUsersForNotifications($user_id, $service_id, $latitude, $longitude)
{
    $tokens = UserServicesModel::join('users as u', 'user_services.user_id', '=', 'u.id')
        ->select(
            'u.token',
            DB::raw('(
                6371 * acos(
                    cos(radians(' . $latitude . ')) *
                    cos(radians(u.latitude)) *
                    cos(radians(u.longitude) - radians(' . $longitude . ')) +
                    sin(radians(' . $latitude . ')) *
                    sin(radians(u.latitude))
                )
            ) AS distance')
        )
        ->where('user_services.service_id', $service_id)
        ->where('user_services.user_id', '<>', $user_id)
        ->whereNotNull('u.token')
        ->having('distance', '<=', 50)
        ->pluck('u.token') // ✅ Get only the tokens
        ->toArray();       // ✅ Convert to plain PHP array

    return $tokens;
}

/**
 * Register push token for mobile app (Expo Push Notifications)
 * This endpoint stores Expo Push Tokens from mobile devices
 */
public function registerPushToken(Request $request)
{
    try {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated'
            ], 401);
        }

        $request->validate([
            'token' => 'required|string',
            'platform' => 'nullable|string|in:ios,android'
        ]);

        $token = $request->input('token');
        $platform = $request->input('platform', 'unknown');

        // Check if it's an Expo Push Token
        $isExpoToken = strpos($token, 'ExponentPushToken') === 0;
        
        // Store the token in user's token field
        // The system will handle both Expo tokens (mobile) and Firebase tokens (web)
        User::where('id', $user->id)->update([
            'token' => $token
        ]);

        Log::info('Push token registered', [
            'user_id' => $user->id,
            'platform' => $platform,
            'is_expo_token' => $isExpoToken,
            'token_prefix' => substr($token, 0, 20) . '...'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Push token registered successfully'
        ], 200);

    } catch (\Exception $e) {
        logger()->error('Error registering push token', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        return response()->json([
            'success' => false,
            'message' => 'Failed to register push token: ' . $e->getMessage()
        ], 500);
    }
}

/**
 * Get all notifications for the authenticated user
 */
public function getNotifications(Request $request)
{
    try {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated'
            ], 401);
        }

        // Get pagination parameters
        $page = $request->query('page', 1);
        $perPage = $request->query('per_page', 20);
        
        // Get notifications from Laravel's notifications table
        // Laravel stores notifications in JSON format
        $notifications = DB::table('notifications')
            ->where('notifiable_id', $user->id)
            ->where('notifiable_type', 'App\\Models\\User')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);

        // Parse notification data
        $formattedNotifications = collect($notifications->items())->map(function ($notification) {
            $data = json_decode($notification->data, true);
            return [
                'id' => $notification->id,
                'type' => $notification->type,
                'title' => $data['title'] ?? 'Notification',
                'body' => $data['body'] ?? $data['message'] ?? '',
                'url' => $data['url'] ?? null,
                'lead_id' => $data['lead_id'] ?? null,
                'sender_id' => $data['sender_id'] ?? null,
                'sender_name' => $data['sender_name'] ?? null,
                'service_name' => $data['service_name'] ?? null,
                'read_at' => $notification->read_at,
                'created_at' => $notification->created_at,
                'is_read' => !is_null($notification->read_at),
            ];
        })->values();

        return response()->json([
            'success' => true,
            'data' => $formattedNotifications,
            'current_page' => $notifications->currentPage(),
            'last_page' => $notifications->lastPage(),
            'total' => $notifications->total(),
            'per_page' => $notifications->perPage(),
        ]);
    } catch (\Exception $e) {
        Log::error('Error fetching notifications', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        
        return response()->json([
            'success' => false,
            'message' => 'Failed to fetch notifications: ' . $e->getMessage()
        ], 500);
    }
}

/**
 * Get unread notification count
 */
public function getUnreadCount(Request $request)
{
    try {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated'
            ], 401);
        }

        $count = DB::table('notifications')
            ->where('notifiable_id', $user->id)
            ->where('notifiable_type', 'App\\Models\\User')
            ->whereNull('read_at')
            ->count();

        return response()->json([
            'success' => true,
            'count' => $count
        ]);
    } catch (\Exception $e) {
        Log::error('Error fetching unread notification count', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        
        return response()->json([
            'success' => false,
            'message' => 'Failed to fetch unread count: ' . $e->getMessage(),
            'count' => 0
        ], 500);
    }
}

/**
 * Mark a notification as read
 */
public function markNotificationAsRead(Request $request, $id)
{
    try {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated'
            ], 401);
        }

        // Update the notification to mark it as read
        $updated = DB::table('notifications')
            ->where('id', $id)
            ->where('notifiable_id', $user->id)
            ->where('notifiable_type', 'App\\Models\\User')
            ->update(['read_at' => now()]);

        if ($updated) {
            return response()->json([
                'success' => true,
                'message' => 'Notification marked as read'
            ]);
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Notification not found'
            ], 404);
        }
    } catch (\Exception $e) {
        Log::error('Error marking notification as read', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        
        return response()->json([
            'success' => false,
            'message' => 'Failed to mark notification as read: ' . $e->getMessage()
        ], 500);
    }
}

/**
 * Mark all notifications as read
 */
public function markAllAsRead(Request $request)
{
    try {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated'
            ], 401);
        }

        $updated = DB::table('notifications')
            ->where('notifiable_id', $user->id)
            ->where('notifiable_type', 'App\\Models\\User')
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json([
            'success' => true,
            'message' => 'All notifications marked as read',
            'count' => $updated
        ]);
    } catch (\Exception $e) {
        Log::error('Error marking all notifications as read', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        
        return response()->json([
            'success' => false,
            'message' => 'Failed to mark all notifications as read: ' . $e->getMessage()
        ], 500);
    }
}

public function clearAllNotifications(Request $request)
{
    try {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated'
            ], 401);
        }

        $deleted = DB::table('notifications')
            ->where('notifiable_id', $user->id)
            ->where('notifiable_type', 'App\\Models\\User')
            ->delete();

        return response()->json([
            'success' => true,
            'message' => 'All notifications cleared',
            'count' => $deleted
        ]);
    } catch (\Exception $e) {
        Log::error('Error clearing all notifications', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        
        return response()->json([
            'success' => false,
            'message' => 'Failed to clear notifications: ' . $e->getMessage()
        ], 500);
    }
}

}