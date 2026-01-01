<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserServicesModel;
use App\Models\ServicesModel;
use App\Http\Controllers\CustomerController; 
use App\Http\Controllers\ProfileController;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\Rules;
use App\Notifications\SendOtpNotification;
use Illuminate\View\View;
use App\Models\Otp;
use Illuminate\Support\Facades\Session;
use Carbon\Carbon;
use App\Services\FirebasePushNotification;
use App\Services\ExpoPushNotification;

class RegisteredUserController extends Controller
{
    public function store(Request $request)
    { 
        try {
            $role = "Customer";
            $distance = '0';
            $dashboard_url = "customer.dashboard";
            if(!isset($request->formData))
            {
                $role = "Expert";
                $distance = $request->distance;
                $dashboard_url = "dashboard";
            }
            
            // Validating the incoming request
           if(isset($request->formData))
           {
            $request->validate([
                'first_name' => ['required', 'string', 'max:255'],
                'last_name' => ['required', 'string', 'max:255'],
                'contact_number' => ['required', 'regex:/^0[6-8][0-9]{8}$/'], // Ensures exactly 10 digits starting with 0
                'location' => ['required', 'string', 'max:255'],
                'latitude' => ['required', 'string', 'max:20'],
                'longitude' => ['required', 'string', 'max:20'],
                'email' => ['required', 'string', 'email', 'max:255'],
            ]);
            
           }
           else{
            $request->validate([
                'first_name' => ['required', 'string', 'max:255'],
                'last_name' => ['required', 'string', 'max:255'],
                'contact_number' => ['required', 'regex:/^0[6-8][0-9]{8}$/'],
                'location' => ['required', 'string', 'max:255'],
                'latitude' => ['required', 'string', 'max:20'],
                'longitude' => ['required', 'string', 'max:20'],
                'email' => ['required', 'string', 'email', 'max:255'],
                'password' => ['nullable', 'confirmed', Password::defaults()],
            ]);
            $isuser = User::where('email', $request->email)->first();
            if ($isuser) {
                return response()->json([
                    "message" => "Account already exists, please signin",
                    "status" => "duplicate"
                ], 500);
            }
           }
          

            // Creating the user
          
            $user = User::firstOrCreate(
                ['email' => $request->email],
                [ 
                    'first_name' => ucfirst($request->first_name),
                    'last_name' => ucfirst($request->last_name),
                    'contact_number' => $request->contact_number,
                    'location' => $request->location,
                    'latitude' => $request->latitude,
                    'longitude' => $request->longitude,
                    'distance' => $distance,
                    'role' => $role,
                    'password' => Hash::make($request->password),
                    'company_name' => $request->company_name,
                    'is_company_website' => $request->is_company_website,
                    'company_size' => $request->company_size,
                    'is_company_sales_team' => $request->is_company_sales_team,
                    'is_company_social_media' => $request->is_company_social_media,
                    'entered_by' => $request->email,

                ]
            );
 
            // Assigning the service
            if(isset($request->formData))
            {
                
                $data = $request->formData;
                $service_id = (int)$request->service_id;
                $description = $request->brief_description;
                $description = empty($description)?"N/A":$description;
                $estimate_quote = (double)$request->estimate_quote;
                $urgent = (int)$request->urgent;
                
                $hiring_decision = (int)$request->hiring_decision;
                $longitude = $request->longitude;
                $latitude = $request->latitude;
                $location = $request->location;
               
                $customer = new CustomerController();
                $num_leads = $customer->getLeadsNumber($user->id);
                if($num_leads >= 2)
                {
                    return response()->json([
                        'status' => 'leads_limit',
                        'message' => 'Daily leads limit reached!'
                    ], 200);
                }
                
                $lead = $customer->createLead($user->id, $service_id, $user->id, $description, $estimate_quote, $urgent, $hiring_decision,$longitude,$latitude,$location);

                // Only call addLeadService if we have valid form data (not for mobile app)
                if (!empty($data) && $data !== '[]' && $data !== json_encode([])) {
                    error_log("About to call addLeadService with data: " . print_r($data, true));
                    $customer->addLeadService($data,$lead->id,$user->id);
                }
         
                $uploadedFiles = [];
                if ($request->hasFile('files')) {
                    foreach ($request->file('files') as $file) {
                        $path = $file->store('uploads', 'public'); 
                        $uploadedFiles[] = $path;
                        $image_name = basename($path);
                        $customer->insertImages($image_name, "Lead", $user->id, $user->id, $lead->id);
                    }
                }
       
                // Save form data to the database (example)
                // $data = $request->except('files'); // This overwrites the formData, commented out
                $service = ServicesModel::find($service_id);

                $profile = new ProfileController();
                $tokens = $profile->getUsersForNotifications($user->id, $service_id, $latitude, $longitude);
                if(count($tokens)>0)
                {
                    // Use unified notification service that handles both Expo and Firebase
                    ExpoPushNotification::sendNotificationToTokens(
                        $tokens,
                        "New Lead near you!!!",
                        "You have received new lead for ".$service->service_name,
                        "https://test.zbsburial.com/public/seller/dashboard"
                    );
                }
                
                // Send OTP for both mobile app and desktop registration
                $otp = rand(1000, 9999);

                // Store OTP in the database
                Otp::create([
                    'user_id' => $user->id,
                    'otp' => $otp,
                    'expires_at' => Carbon::now()->addMinutes(10) // OTP expires in 10 minutes
                ]);

                // Store OTP in session (optional)
                Session::put('otp', $otp);
                Session::put('otp_user_id', $user->id);
                Session::put('dashboard_url', $dashboard_url);
                 
                // Send OTP to the user's email
                $user->notify(new SendOtpNotification($otp));

                return response()->json([
                    'status' => 'success_otp',
                    'user' => [
                        'id' => $user->id,
                        'first_name' => $user->first_name,
                        'last_name' => $user->last_name,
                        'email' => $user->email,
                        'role' => $user->role,
                        'contact_number' => $user->contact_number,
                        'location' => $user->location
                    ],
                    'message' => 'OTP sent to your email. Please check your email and enter the verification code.',
                    'redirect_url' => route('verify.otp.form')
                ], 200);
            }
            else{
                UserServicesModel::create([
                    'user_id' => $user->id,
                    'service_id' => (int)$request->service_id,
                    'entered_by' => $user->id,
                ]);
                
                // For expert registration, login directly
                event(new Registered($user));
                Auth::login($user);
                return response()->json([
                    "message" => "Congratulations for signing up you can now view your leads!!!!",
                    'status' => 'success_login',
                    "redirect_url" => route('customer.dashboard')
                ], 200);
            }
        
        } catch (\Exception $e) {
            return response()->json(["message" => "Error: " . $e->getMessage(), 'status' => 'error'], 500);
        }
    }

    public function registerLogged(Request $request)
    { 
        try {
           
            // Validating the incoming request
            $user = $request->user();               

 
            // Assigning the service
            if(isset($request->formData))
            {
                
                $data = $request->formData;
                $service_id = (int)$request->service_id;
                $description = $request->brief_description;
                $description = empty($description)?"N/A":$description;
                $estimate_quote = (double)$request->estimate_quote;
                $urgent = (int)$request->urgent;
                
                $hiring_decision = (int)$request->hiring_decision;
                $longitude = $request->longitude;
                $latitude = $request->latitude;
                $location = $request->location;
                
                $customer = new CustomerController();
                $num_leads = $customer->getLeadsNumber($user->id);
                if($num_leads >= 2)
                {
                    return response()->json([
                        'status' => 'leads_limit',
                        'message' => 'Daily leads limit reached!'
                        
                    ], 200);
                }
                $lead = $customer->createLead($user->id, $service_id, $user->id, $description, $estimate_quote, $urgent, $hiring_decision,$longitude,$latitude,$location);
              
                $customer->addLeadService($data,$lead->id,$user->id);
         
                $uploadedFiles = [];
                if ($request->hasFile('files')) {
                    foreach ($request->file('files') as $file) {
                        $path = $file->store('uploads', 'public'); 
                        $uploadedFiles[] = $path;
                        $image_name = basename($path);
                        $customer->insertImages($image_name, "Lead", $user->id, $user->id, $lead->id);
                    }
                }
       
                // Save form data to the database (example)
                // $data = $request->except('files'); // This overwrites the formData, commented out
                $service = ServicesModel::find($service_id);

                $profile = new ProfileController();
                $tokens = $profile->getUsersForNotifications($user->id, $service_id, $latitude, $longitude);
                if(count($tokens)>0)
                {
                    // Use unified notification service that handles both Expo and Firebase
                    ExpoPushNotification::sendNotificationToTokens(
                        $tokens,
                        "New Lead near you!!!",
                        "You have received new lead for ".$service->service_name,
                        "https://test.zbsburial.com/public/seller/dashboard"
                    );
                }
            }
            else{
                UserServicesModel::create([
                    'user_id' => $user->id,
                    'service_id' => (int)$request->service_id,
                    'entered_by' => $user->id,
                ]);
            }

          return response()->json([
            "message" => "Success",
            "status"=>"success_login",
            "redirect_url" => route('customer.dashboard')
        ], 200);       
       
        
        } catch (\Exception $e) {
            return response()->json(["message" => "Error: " . $e->getMessage()], 500);
        }
    }

    public function showOtpForm()
{
    return view('auth.otp'); // Display the OTP form
}
public function verifyOtp(Request $request)
{
    $request->validate([
        'otp' => 'required|digits:4',
    ]);
    $userId = (int)Session::get('otp_user_id');

    $otpRecord = Otp::where('user_id', $userId)
        ->where('otp', $request->otp)
        ->where('is_used', false)
        ->where('expires_at', '>=', Carbon::now())
        ->first();

        if ($otpRecord) {
            $otpRecord->update(['is_used' => true]); // Mark OTP as used

    $inputOtp = $request->input('otp');
    $sessionOtp = Session::get('otp');
    $userId = Session::get('otp_user_id');
    $dashboard_url = Session::get('dashboard_url');

    if ($inputOtp == $sessionOtp) {
        Session::forget('otp');
        Session::forget('otp_user_id');

        Auth::loginUsingId($userId);

        return redirect()->route($dashboard_url)->with('message', 'Account verified successfully!');
    }
    else{
        return redirect()->route('verify.otp.form')->with('error', 'Invalid OTP. Please try again.');  
    }
}

    return redirect()->route('verify.otp.form')->with('error', 'Invalid OTP. Please try again.');
}

public function create(): View
{
    return view('auth.register');
}


}