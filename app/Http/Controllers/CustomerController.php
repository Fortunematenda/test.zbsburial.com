<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ServiceQuestionModel;
use App\Models\ServicePossibleAnswerModel;
use App\Models\LeadsModel;
use App\Models\ServicesModel;
use App\Models\LeadsServiceModel;
use App\Models\LeadsNotesModel;
use App\Models\ContactedLeadsModel;
use App\Models\ImagesModel;
use App\Models\RatingsModel;
use App\Models\LeadsTrailModel;
use App\Models\TrailsModel;
use App\Services\FirebasePushNotification;
use App\Models\User;
use App\Helpers\CacheHelper;
use Exception;
use DateTime;
use Carbon\Carbon;
class CustomerController extends Controller
{
    public function customerdashboard(Request $request)
{
    $slot = "";
    session(['temp_role' => "Customer"]);
    $user = $request->user();
    $user_id = $user->id;

    $leads = LeadsModel::join('master_services as m', 'leads.service_id', '=', 'm.id')
        ->where('leads.user_id', $user_id)
        ->orderBy('leads.id', 'DESC')
        ->get(['leads.*', 'm.*', 'leads.date_entered', 'leads.id as lead_id']);

    // Get services with IDs and names (using cache for better performance)
    $services = CacheHelper::getServices();
//$services = ServicesModel::pluck('service_name')->toArray();
    $user_leads = [];

    foreach ($leads as $lead) {
        $lead_id = $lead["lead_id"];
        $service_name = $lead["service_name"];
        $date_entered = $lead["date_entered"];

        $date = new DateTime($date_entered);
        $formatted_date = $date->format('l H:i');
        $isExpertApplied = ContactedLeadsModel::where('lead_id', $lead_id)->count();

        $inarr = [
            "lead_id" => $lead_id,
            "service_name" => $service_name,
            "status" => $lead["status"],
            "date_entered" => $formatted_date,
            "isExpertApplied" => $isExpertApplied,
        ];

        array_push($user_leads, $inarr);
    }

    return view('customer.dashboard', compact("slot", "user_leads", "services"));
}


    public function createRequest()
    {
        $slot = "";
       
        return view('customer.createrequests',compact(["slot"]));
    }

    public function createCustomer()
    {
        $slot = "";
        return view('customer.customercreate',compact(["slot"]));
    }

    public function showRequests()
    {
        $slot = "";
        return view('customer.requests',compact(["slot"]));
    }
    
   

    public function expertView()
    {
        $slot = "";
        $profession = null; // Replace with actual fetching logic

        return view('customer.expertview', compact('profession'));
    }

    public function customerSettings(Request $request)
    {
        $slot = "";
        $user = $request->user();
        $profession = null; // Replace with actual fetching logic

        return view('customer.customersettings', compact(['profession', 'user']));
    }
    
     public function expertProfile()
    {
        $slot = "";
        $profile = null; // Replace with actual fetching logic

        return view('customer.expertprofile', compact('profile'));
    }
    public function getServicesQuestions(Request $request)
    {
        try{
     $service_id = (int)$request->service_id;
     $questions = ServiceQuestionModel::select('service_questions.service_id', 'service_questions.question', 'service_questions.id as question_id', 'service_possible_answers.service_answer','service_possible_answers.id')
     ->join('service_possible_answers', 'service_possible_answers.service_questions_id', '=', 'service_questions.id')
     ->where('service_questions.service_id', $service_id)
     ->get()
     ->groupBy('question')
     ->map(function ($items, $question) {
         return [
            'question_id'=>$items->first()->question_id,
             'question' => $question, 
             'answers' => $items->pluck('service_answer')->all()
         ];
     })
     ->values(); 
     return response()->json(["message"=>"Okay","questions"=>$questions,"service_id"=>$request->service_id],200);
        }
        catch(Exception $e)
        {
            return response()->json(["message"=>"There is an error"],500);
        }

    }
    private function getCreditRange($service_id)
    {
        $credits = ServicesModel::where('id', $service_id)
        ->select('min_credits', 'max_credits')
        ->first();
        return $credits;
    }
    private function getActualQuestion($question_id)
    {
        $question = ServiceQuestionModel:: where('id','=',$question_id)->first();
        return $question->question;
    }
    public function addLeadService($arr,$lead_id,$entered_by)
    {
        // Debug: Log what we're receiving
        error_log("addLeadService received: " . print_r($arr, true));
        
        $arr = json_decode($arr, true);
        
        // Debug: Log what we get after json_decode
        error_log("addLeadService after json_decode: " . print_r($arr, true));
        
        // Check if $arr is an array before filtering
        if (!is_array($arr)) {
            error_log("addLeadService: $arr is not an array, skipping");
            return;
        }
     
        $filteredData = array_filter($arr, function($item) {
            return isset($item['name']) && str_starts_with($item['name'], 'x_');
        });
        
        $arry = [];
        
        foreach($filteredData as $row)
        {
            $question_id = (int)substr($row["name"], 2);
            $question = $this->getActualQuestion($question_id);
            $answer = $row["value"];
            $inarr = array("question_id"=>$question_id,"answer"=>$answer,"question"=>$question);
            array_push($arry,$inarr);
        }
        $questions = json_encode($arry,true);
        LeadsServiceModel::create(["lead_id"=>$lead_id, "service_details"=>$questions, "entered_by"=>$entered_by]);
        
    }
    public function createLead($user_id, $service_id, $entered_by, $description, $estimate_quote, $urgent, $hiring_decision,$longitude,$latitude,$location)
    {
        try{
            $creditsArr = $this->getCreditRange($service_id);
            $min_credits = (int)$creditsArr["min_credits"];
            $max_credits = (int)$creditsArr["max_credits"];
            $credits = rand($min_credits,$max_credits);
            $lead = LeadsModel::create(attributes: [
                "user_id"=>$user_id, 
                "service_id"=>$service_id, 
                "credits"=>$credits, 
                "entered_by"=>$entered_by, 
                "description"=>$description, 
                "estimate_quote"=>$estimate_quote, 
                "urgent"=>$urgent, 
                "hiring_decision"=>$hiring_decision,
                "longitude"=>$longitude,
                "latitude"=>$latitude,
                "location"=>$location,
                "temp_code"=>0
               ]);
               return $lead;
        }
        catch(Exception $e)
        {
            return [];
        }

        
    }

public function insertImages($image_name, $category, $entered_by, $user_id, $lead_id)
{
    $image = ImagesModel::create([
        "image_name"=>$image_name, "category"=>$category, "entered_by"=>$entered_by, "user_id"=>$user_id, "lead_id"=>$lead_id
    ]);
    return  $image;
}

public function getLeadsNotes($lead_id,$contact_user_id)
{
    try{
        $lead = LeadsModel::where('id',$lead_id)->first();
        // Construct comm_link with smaller ID first (must match mobile API logic)
        $comm_link = ($lead->user_id < $contact_user_id) 
            ? $lead->user_id . '_' . $contact_user_id 
            : $contact_user_id . '_' . $lead->user_id;
        
        // Also get the reverse order for backward compatibility with old messages
        $comm_link_reverse = ($lead->user_id < $contact_user_id) 
            ? $contact_user_id . '_' . $lead->user_id 
            : $lead->user_id . '_' . $contact_user_id;
        //echo $comm_link;
    
    $notes = LeadsNotesModel::join('users as u','lead_notes.user_id','=','u.id')
    ->join('leads as l','lead_notes.lead_id','=','l.id')
    ->join('master_services as m','l.service_id','=','m.id')
    ->select('u.first_name','lead_notes.description','m.service_name','lead_notes.date_entered','lead_notes.user_id', 'l.user_id as leads_user_id')        
    ->where(function($query) use ($comm_link, $comm_link_reverse) {
        $query->where('lead_notes.comm_link', $comm_link)
              ->orWhere('lead_notes.comm_link', $comm_link_reverse);
    })
    ->where('lead_notes.lead_id',$lead_id)->get();
    return $notes;
}
catch(Exception $e){
    
    return [];
}
}

public function expertReplies(Request $request)
{
    $lead_id = (int) $request->kmm;

    // Get experts who replied to this lead
    $replyexperts = ContactedLeadsModel::where('lead_id', $lead_id)
        ->join('leads', 'contacted_lead.lead_id', '=', 'leads.id')
        ->join('users', 'contacted_lead.user_id', '=', 'users.id')
        ->select('users.first_name', 'users.last_name', 'contacted_lead.user_id')
        ->orderBy('contacted_lead.id')
        ->get();

    $user_id = 0;
    $expertnotes = [];
    $lastSeen = null;
    $lastSeenDate = null;  // initialize
    $isOnline = false;  // initialize

    if ($replyexperts->isNotEmpty()) {
        $user_id = $replyexperts[0]->user_id;

        $expertnotes = $this->getLeadsNotes($lead_id, $user_id);

        $expert = \App\Models\User::with('leadNotes')->find($user_id);

        $lastSeen = $expert?->last_lead_note_description ?? 'No recent notes';

        // Get last note date from expert only (filter by user_id)
        $lastSeenDate = optional(
            $expert->leadNotes()
                ->where('user_id', $user_id)  // only notes by expert
                ->orderByDesc('date_entered')
                ->first()
        )->date_entered;

        $isOnline = $expert ? $expert->isOnline() : false;
    }

    return view('customer.expertreplies', compact(
        'replyexperts',
        'expertnotes',
        'user_id',
        'lead_id',
        'lastSeen',
        'isOnline',
        'lastSeenDate'  // pass lastSeenDate to view
    ));
}


private function createPushNotification($title,$body,$deviceToken,$uri)
{
    if(strlen($deviceToken)>9) 
    {
        FirebasePushNotification::sendNotification($title, $body, $deviceToken,$uri); 
    }
}

public function postNote(Request $request)
{
    try{ 
        $user_id = (int)$request->user_id;
        $lead_id = (int)$request->lead_id;
        $lead = LeadsModel::where('id',$lead_id)->first();
        $description = $request->description;
        // Construct comm_link with smaller ID first (must match mobile API logic)
        $comm_link = ($lead->user_id < $user_id) 
            ? $lead->user_id . '_' . $user_id 
            : $user_id . '_' . $lead->user_id;
        $user = User::find($user_id);
        $deviceToken = $user->token;
    
    $note = LeadsNotesModel::create(["lead_id"=>$lead_id,"description"=>$description,"entered_by"=>$user_id,"user_id"=>$user_id,"comm_link"=>$comm_link]);  
   $this->createPushNotification("New message received!!", $note, $deviceToken,"https://test.zbsburial.com/responses");
      
    return response()->json(["message"=>"Note Successfully added","note"=>$note, "date_entered" => date("Y-m-d H:i:s")],200);
}
catch(Exception $e){
    return response()->json(["message"=>"There is an error : ".$e->getMessage()],500);
}
}

public function getLeadsNumber($user_id){
    $date = date("Y-m-d");
    return LeadsModel::where("user_id",$user_id)->where("date_entered", "LIKE", "%$date%")->count();
}

public function getImages($user_id, $category="Profile")
{
    $images = ImagesModel::where("user_id",$user_id)->where("category",$category)->get();
    return  $images;
}

public function getReviews($user_id)
{
    $ratings = RatingsModel::join("users as u", "ratings.to_user_id", "=", "u.id")
        ->where("ratings.to_user_id", $user_id)
        ->select(
            "ratings.from_user_id",
            "ratings.to_user_id",
            "ratings.lead_id",
            "ratings.rating",
            "ratings.date_entered",
            "ratings.comment",
            "u.first_name"
        )
        ->get();

    return $ratings;
}


public function insertRatings(Request $request)
{
    try {
        // Validate request data
        $request->validate([
            'contacted_user_id' => 'required|integer|exists:users,id',
            'lead_id' => 'required|integer|exists:leads,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:500',
        ]);

        // Get the authenticated user
        $user = $request->user();
        $user_id = $user->id;

        // Extract request data
        $to_user_id = $request->contacted_user_id;
        $lead_id = $request->lead_id;
        $rating = $request->rating;
        $comment = $request->comment;

        // Create rating record
        $ratings = RatingsModel::create([
            'from_user_id' => $user_id,
            'to_user_id' => $to_user_id,
            'lead_id' => $lead_id,
            'rating' => $rating,
            'comment' => $comment,
        ]);

        return response()->json([
            "message" => "Review posted successfully",
            "status" => "success",
            "ratings" => $ratings
        ], 200);
    }  catch (Exception $e) {
        return response()->json([
            "message" => "An error occurred",
            "status" => "error",
            "error" => $e->getMessage(),
        ], 500);
    }
}

public function getMyLeads(Request $request)
{
    try {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'status'  => 'error',
                'message' => 'User not authenticated'
            ], 401);
        }

        $limit = (int) $request->input('limit', 10);
        
        // Get customer's active leads (both responded and unresponded)
        // User must close their requests manually, so we show all active requests
        $leads = LeadsModel::select(
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
            ->where('leads.user_id', $user->id)
            ->whereNotIn('leads.status', ['Closed', 'Bought', 'Unavailable'])
            ->orderBy('leads.date_entered', 'desc')
            ->limit($limit)
            ->get();

        $transformed = $leads->map(function ($lead) {
            return [
                'id'           => $lead->id,
                'title'        => $lead->service_name ?? 'Service Request',
                'description'  => $lead->description,
                'category'     => $lead->service_name ?? 'General Services',
                'budget'       => $lead->estimate_quote ? 'R' . number_format($lead->estimate_quote, 2) : 'Budget not set',
                'location'     => $lead->location,
                'urgency'      => $lead->urgent ? 'Urgent' : 'Normal',
                'date'         => Carbon::parse($lead->date_entered)->diffForHumans(),
                'status'       => 'pending',
                'responseCount'=> 0,
                'statusMessage'=> "Waiting for experts to respond"
            ];
        });

        return response()->json([
            'status'  => 'success',
            'message' => 'Active requests retrieved successfully',
            'data'    => $transformed
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'status'  => 'error',
            'message' => $e->getMessage()
        ], 500);
    }
}

public function addLeadTrail($user_id, $lead_id,$trail_id)
{
    $fixed_trail = TrailsModel::where('id',$trail_id)->first();
    $description = $fixed_trail["trail"];
    $trail = LeadsTrailModel::create([
        'lead_id'=>$lead_id, 
        'user_id'=>$user_id, 
        'description'=>$description, 
        'entered_by'=>$user_id
                ]);
                return $trail;
}
private function safeBase64Decode($data) {
    $data = str_replace(['-', '_'], ['+', '/'], $data);
    return base64_decode($data);
}
public function decryptNumber($encryptedData, $key)
{
    $cipher = "AES-256-CBC";
    $encryptedData = $this->safeBase64Decode($encryptedData);
    $ivLength = openssl_cipher_iv_length($cipher);
    $iv = substr($encryptedData, 0, $ivLength);
    $encrypted = substr($encryptedData, $ivLength);
    
    return openssl_decrypt($encrypted, $cipher, $key, 0, $iv);
}

public function mTest(Request $request)
{
    try{ 
    
        
    $deviceToken = "ee32He87S2-aT6qWaXiBnB:APA91bFX_9lWIZY4_wodhf9cI9y5LyWUSwxQQtijfLndDaLYWD4R_25s_LPfhBdWu_aOzDP3cpjlFFq3Wzm7vKbDOm7wUMEFLGI0BME_Wj5d913-w-vFoZw";
    $this->createPushNotification("New message received!!", "Zvakamira sei", $deviceToken);  
    return response()->json(["message"=>"Note Successfully addedgd"],200);
}
catch(Exception $e){
    return response()->json(["message"=>"There is an error : ".$e->getMessage()],500);
}
}
}
