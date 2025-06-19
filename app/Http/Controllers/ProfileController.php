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
use Illuminate\View\View;
use App\Models\ServicesModel;
use App\Models\UserServicesModel;
use App\Models\ImagesModel;
use App\Models\LeadsModel;
use App\Models\ContactedLeadsModel;
use App\Models\User;
use App\Models\CreditsTrailModel;
use App\Notifications\SendOtpNotification;
use Exception;

class ProfileController extends Controller
{
  
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
    $urgentTotal = LeadsModel::join('user_services as u', 'leads.service_id', '=', 'u.service_id')
        ->join('master_services as m', 'u.service_id', '=', 'm.id')
        ->join('users as s', 'leads.user_id', '=', 's.id')
        ->select('leads.*')
        ->selectRaw('
            (
                6371 * acos(
                cos(radians('.$user->latitude.')) 
                * cos(radians(leads.latitude)) 
                * cos(radians(leads.longitude) - radians('.$user->longitude.')) 
                + sin(radians('.$user->latitude.')) 
                * sin(radians(leads.latitude))
                )
            ) AS distance
        ')
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
        })
        ->whereRaw('
            (
                   6371 * acos(
                cos(radians('.$user->latitude.')) 
                * cos(radians(leads.latitude)) 
                * cos(radians(leads.longitude) - radians('.$user->longitude.')) 
                + sin(radians('.$user->latitude.')) 
                * sin(radians(leads.latitude))
                )
            ) <= ?
        ', [$user->distance]);  // Filter by distance using WHERE

    return $urgentTotal->count();
}

    public function getLeads($user, $page=0,$perPage=0,$offset=0,$filter=0, $sortdistance=0)
    {
        $user_id = $user->id;
        $query = LeadsModel::join('user_services as u', 'leads.service_id', '=', 'u.service_id')
    ->join('master_services as m', 'u.service_id', '=', 'm.id')
    ->join('users as s', 'leads.user_id', '=', 's.id')
    ->select(
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
        // Calculate the distance and include it in the result
        DB::raw('(
               6371 * acos(
                cos(radians('.$user->latitude.')) 
                * cos(radians(leads.latitude)) 
                * cos(radians(leads.longitude) - radians('.$user->longitude.')) 
                + sin(radians('.$user->latitude.')) 
                * sin(radians(leads.latitude))
            )
        ) AS distance')
    )
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
   
    $query->havingRaw('distance <= '.$user->distance);  // Only include leads within 20km
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

$query->orderBy('ln_full.date_entered', 'desc');

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
        $results = LeadsModel::join('user_services as u', 'leads.service_id', '=', 'u.service_id')
        ->join('master_services as m', 'u.service_id', '=', 'm.id')
        ->join('users as s', 'leads.user_id', '=', 's.id')
        ->select('m.service_name', 'leads.user_id as lead_user_id', 'u.user_id as user_service_user_id', 'leads.service_id', 'leads.id')
        ->selectRaw('
            (
                6371 * acos(
                cos(radians('.$user->latitude.')) 
                * cos(radians(leads.latitude)) 
                * cos(radians(leads.longitude) - radians('.$user->longitude.')) 
                + sin(radians('.$user->latitude.')) 
                * sin(radians(leads.latitude))
                )
            ) AS distance
        ')
        ->where('u.user_id', $user->id)
        ->where('leads.status', '=', 'Open')
        ->where('u.user_id', $user->id)
        ->whereNotIn('leads.id', function ($query) use ($user) {
            $query->select('lead_id')
                  ->from('leads_read')
                  ->where('user_id', $user->id);
        })
        ->havingRaw('distance <= '.$user->distance)
        ->count();

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
    $userId = auth()->user()->id; // Get the authenticated user's ID
    $transactions = $this->getCreditHistory($userId); // Call the private function to get transactions

    return view('transaction-history', compact('transactions')); // Ensure this view exists
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
    $user->update([
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
    $user->update($validatedData);

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

}