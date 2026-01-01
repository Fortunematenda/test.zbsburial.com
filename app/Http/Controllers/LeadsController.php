<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use App\Models\ServicesModel;
use App\Models\User;
use App\Models\ContactedLeadsModel;
use App\Models\UserServicesModel;
use App\Models\LeadsModel;
use App\Models\LeadsServiceModel;
use App\Models\CreditsTrailModel;
use App\Http\Controllers\ProfileController; 
use App\Http\Controllers\TemplatesController; 
use Illuminate\Support\Facades\DB;
use App\Models\ServicePossibleAnswerModel;
use App\Models\ImagesModel;
use App\Models\LeadsTrailModel;
use App\Models\TrailsModel;
use App\Models\LeadsNotesModel;
use App\Models\LeadsReadModel;
use Illuminate\Support\Facades\Mail;
use App\Services\FirebasePushNotification;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Exception;

class LeadsController extends Controller
{
    public function getUserLeads(Request $request)
    {
        try{
            $page = $request->input('page', 1);
            $perPage = 5; // Number of records per page
             $offset = ($page - 1) * $perPage;
             $filter = $request->input('filter', 0);
             $sortdistance = $request->input('sortdistance', 0);
        
            $user = $request->user();
            $userId = $user->id;     
            $profileController = new ProfileController();
            $leads = $profileController->getLeads($user,$page, $perPage,$offset,$filter,$sortdistance);    
            $befirst_count = $profileController->getLeadsCount($user,1);
            $urgent_count = $profileController->getLeadsCount($user,2);           
            
            
            $leadsArr = $this->arrLeads($leads["data"]); 
            $current_page =  (int)$leads["current_page"];
            $last_page =  $leads["last_page"]; 
            $leads_count = $leads["total"]; 
    $resultArr = array("leadsArr"=>$leadsArr,"leads_count"=>$leads_count,"current_page"=>$current_page,"befirst_count"=>$befirst_count,"urgent_count"=>$urgent_count,"last_page"=>$last_page);
            
            return response()->json(["message"=>"Successful","leads"=>$resultArr],200);
        }
        catch(Exception $e)
        {
            return response()->json(["message"=>"There is an error : ".$e->getMessage()],500); 
        }
    }
    public function showLeads(Request $request)
{
    $user = $request->user();
    $userId = $user->id;     
    $profileController = new ProfileController();
    $services_count = count($profileController->getUserServices($userId));
    $distance = $user->distance;
    
    return view("leads.show-leads", compact(["services_count","distance"]));
}

public function getLeadDetails(Request $request)
{
    $user = $request->user();
    $lead_id = $request->lead_id;
    $profileController = new ProfileController();
    $templates = new TemplatesController();
    $lead = $profileController->getIndividualLead($lead_id);
    $first_letter = substr($lead->first_name, 0, 1);
    $first_name = $lead->first_name;
    $last_name = $lead->last_name;
    $contacted = (int)$this->userResponse($lead_id);
    $remender = 5-$contacted;
    $lead_user_id  = (int)$lead->lead_user_id;
    $frequent = $this->frequentUser($lead_user_id);
    $urgent = (int)$lead->urgent;
    $is_phone_verified = (int)$lead->is_phone_verified;
    $time = $this->timeAgo($lead->date_entered);
    $service_name = $lead->service_name;
    $location = $lead->location;
    $description = $lead->description; 
    $hiring_decision = (int)$lead->hiring_decision;
    $credits = $lead->credits;
    $email = $lead->email;
    $contact_number = $lead->contact_number;
    $masked_email = $this->maskEmail($email);
    $lead_details = $this->getLeadServiceDetails($lead_id);
    $masked_contact_number = $this->maskPhoneNumber($contact_number);
    LeadsReadModel::firstOrCreate(
        ['lead_id' => $lead_id, 'user_id' => $user->id],
        ['entered_by' => $user->id]
    );
    $lead_images = $this->getImages($lead_id);
   
$details = $templates->showLeadsDetails($lead_id,$lead,$first_letter,$first_name,$last_name,$contacted,$remender,$lead_user_id,$frequent,$urgent,$is_phone_verified,$time,$service_name,$location,$description,$hiring_decision,$credits,$masked_email,$masked_contact_number,$lead_details,$lead_images);

    return response($details);
}
public function getResponseDetails(Request $request)
{
    $user = $request->user();
    $lead_id = $request->lead_id;
    $profileController = new ProfileController();
    $templates = new TemplatesController();
      
    $lead = $profileController->getIndividualLead($lead_id);
    $first_letter = substr($lead->first_name, 0, 1);
    $first_name = $lead->first_name;
    $last_name = $lead->last_name;
   
    $contacted = (int)$this->userResponse($lead_id);
    $remender = 5-$contacted;
    $lead_user_id  = (int)$lead->lead_user_id;
    $frequent = $this->frequentUser($lead_user_id);
    $urgent = (int)$lead->urgent;
    
    $is_phone_verified = (int)$lead->is_phone_verified;
    $time = $this->timeAgo($lead->date_entered);
    $service_name = $lead->service_name;
    $location = $lead->location;
    $description = $lead->description; 
    $hiring_decision = (int)$lead->hiring_decision;
    $credits = $lead->credits;
    $email = $lead->email;
    
    $contact_number = $lead->contact_number;
    $lead_status = $lead->status;
    
    $conl = $this->contactedLead($user->id,$lead_id);
    $lead_status = $conl["status"];
  
    $leads_trail = $this->getLeadsTrail($lead_id,$user->id);
    $leads_notes = $this->getLeadsNotes($lead_id,$user->id);
    $lead_details = $this->getLeadServiceDetails($lead_id);
    
    $lead_images = $this->getImages($lead_id);
  
    $lastresponded = $this->timeAgo($leads_notes[0]->date_entered);
    
   
$details = $templates->showResponseDetails( $lead_id,$lead,$first_letter,$first_name,$last_name,$contacted,$remender,$lead_user_id,$frequent,$urgent,$is_phone_verified,$time,$service_name,$location,$description,$hiring_decision,$credits,$email,$contact_number,$lead_status,$leads_trail,$leads_notes,$lead_details,$lead_images, $lastresponded);
//$details ="YThgf";
    return response($details);
}
public function arrLeads($leads = array(), $resp = 0,$loggedin_user_id = 0)
{
    $leadsArr = array();

    foreach($leads as $lead)
    {
        $lead_id = $lead->id;
        $first_letter = substr($lead->first_name, 0, 1);
        $first_name = $lead->first_name;
        $last_name = $lead->last_name;
        $lead_user_id  = (int)$lead->lead_user_id;
        if($resp == 0){
            $contacted = (int)$this->userResponse($lead_id);
            $remender = 5-$contacted;
            $distance = round($lead->distance);
            $leads_notes = [];
            $lastresponded = "";
        }
        else{
            $contacted = 0;
            $remender = 0;
            $distance = 0;
            $leads_notes = $this->getLeadsNotes($lead_id,$loggedin_user_id) ?? [];
            $lastresponded = $this->timeAgo($lead->latest_note_date);
            //$lastresponded = "";
        }        
        
        $frequent = $this->frequentUser($lead_user_id);
        $urgent = (int)$lead->urgent;
        $is_phone_verified = (int)$lead->is_phone_verified;
        $time = $this->timeAgo($lead->date_entered);
        // For contacted leads (resp == 1), also include contact time
        $contacted_time = $resp == 1 ? ($lead->contacted_date ? $this->timeAgo($lead->contacted_date) : '') : '';
        // Add actual datetime fields
        $posted_datetime = $lead->date_entered ? date('Y-m-d H:i:s', strtotime($lead->date_entered)) : null;
        $contacted_datetime = ($resp == 1 && $lead->contacted_date) ? date('Y-m-d H:i:s', strtotime($lead->contacted_date)) : null;
        $service_name = $lead->service_name;
        $location = $lead->location;
        $contacted_status = $lead->contacted_status ?? 'Not Set';
        $description = $lead->description;
        
        $hiring_decision = (int)$lead->hiring_decision;    
        $credits = $lead->credits;
        $additional_details = (int)strlen($description);
        $leads_trail = $this->getLeadsTrail($lead_id, $lead_user_id) ?? [];
        
        // Calculate customer statistics (jobs hired and rate)
        $total_leads = \App\Models\LeadsModel::where('user_id', $lead_user_id)->count();
        $hired_jobs = \App\Models\ContactedLeadsModel::join('leads', 'contacted_lead.lead_id', '=', 'leads.id')
            ->where('leads.user_id', $lead_user_id)
            ->where('contacted_lead.status', 'Hired')
            ->count();
        $hired_rate = $total_leads > 0 ? round(($hired_jobs / $total_leads) * 100, 1) : 0;
        $customer_rating = $total_leads > 0 ? round(($hired_jobs / $total_leads) * 5, 1) : 0;
        
        // Get budget from lead - format it properly
        $budget = null;
        if (isset($lead->budget) && !empty($lead->budget)) {
            $budget = $lead->budget;
        } elseif (isset($lead->estimate_quote) && !empty($lead->estimate_quote)) {
            $budget = 'R' . number_format($lead->estimate_quote, 2);
        }
        
        $inarr = array("lead_id"=>$lead_id,"first_letter"=>$first_letter,"first_name"=>$first_name,"last_name"=>$last_name,"time"=>$time,"service_name"=>$service_name,"location"=>$location,"distance"=>$distance,"contacted"=>$contacted,"remender"=>$remender,"frequent"=>$frequent,"urgent"=>$urgent,"is_phone_verified"=>$is_phone_verified,"additional_details"=>$additional_details,"credits"=>$credits,"hiring_decision"=>$hiring_decision, "leads_trail" => $leads_trail, "contacted_status"=>$contacted_status,
        "leads_notes" => $leads_notes, "lastresponded"=>$lastresponded,"description"=>$description,
        "hired_jobs"=>$hired_jobs, "hired_rate"=>$hired_rate, "customer_rating"=>$customer_rating,"contacted_time"=>$contacted_time,"posted_datetime"=>$posted_datetime,"contacted_datetime"=>$contacted_datetime,"budget"=>$budget);
        array_push($leadsArr,$inarr);

    }  
    return $leadsArr;
}

    public function showResponses(Request $request)
    {        
        return view('leads.responses');
    }
    public function getUserResponses(Request $request)
    {
        try{
            $page = (int)$request->input('page', 1);
            $perPage = 5; // Number of records per page
             $offset = ($page - 1) * $perPage;
             $filter = (int)$request->input('filter', 0);
        
            $user = $request->user();
            $userId = $user->id;     
            $profileController = new ProfileController();
            $leads = $profileController->getResponseLeads($userId,$page, $perPage,$offset,$filter); 
            $pending_count = $profileController->getResponseLeadsCount($userId,1);
            $hired_count = $profileController->getResponseLeadsCount($userId,2);
            
            $leadsArr = $this->arrLeads($leads["data"], 1, $userId); 
            $current_page =  (int)$leads["current_page"];
            $last_page =  $leads["last_page"]; 
            $leads_count = $leads["total"]; 
    $resultArr = array("leadsArr"=>$leadsArr,"leads_count"=>$leads_count,"pending_count"=>$pending_count, "hired_count"=>$hired_count, "current_page"=>$current_page,"last_page"=>$last_page,"filter"=>$filter);
            
            return response()->json(["message"=>"Successful","leads"=>$resultArr],200);
        }
        catch(Exception $e)
        {
            return response()->json(["message"=>"There is an error : ".$e->getMessage()],500); 
        }
    }
    public function showHelp()
    {       

        return view("leads.help");
    }
    public function getServices(Request $request)
    {  
        $serviceTxt = $request->serviceTxt;
        try{
            $services = ServicesModel::where("service_name", "LIKE", "%{$serviceTxt}%")->select("service_name","id")->get();
            return response()->json(["message"=>"success","services"=>$services],200);
        }   
        catch(Exception $e) 
        {
            return response()->json(["message"=>"There is an error : ".$e->getMessage()],500);
        }

    }
    public function userResponse($lead_id)
    {
        return ContactedLeadsModel::where('lead_id',$lead_id)->count();
    }
    public function getImages($lead_id)
    {
        return ImagesModel::where('lead_id',$lead_id)->get();
    }
    public function frequentUser($user_id)
    {
        $leads = LeadsModel::select(DB::raw("DATE_FORMAT(date_entered, '%Y-%m-%d') as dat"))
    ->where('user_id', $user_id)
    ->groupBy(DB::raw("DATE_FORMAT(date_entered, '%Y-%m-%d')"))
    ->get($user_id);

    return (int)count($leads);
    }

    function timeAgo($datetime, $full = false) {
        $now = new \DateTime;
        $ago = new \DateTime($datetime);
        $diff = $now->diff($ago);
        $dd = date('Y-m-d H:i:s');
    
        $diff->w = floor($diff->d / 7);  // Calculate weeks
        $diff->d -= $diff->w * 7;        // Subtract the weeks
    
        $string = ['y' => 'year','m' => 'month','w' => 'week','d' => 'day', 'h' => 'h','i' => 'm', 's' => 's',];
    
        foreach ($string as $k => &$v) {
            if ($diff->$k) {
                $v = $diff->$k . ' ' . $v . ($diff->$k > 1 ? '' : '');
            } else {
                unset($string[$k]);
            }
        }
    
        if (!$full) $string = array_slice($string, 0, 1);
    
        return $string ? implode(', ', $string) . ' ago ': 'just now';
    }


    public function getContactNumber($userId)
    {
        $user = UserServicesModel::find( $userId);

        if ($user) {
            return $user->contact_number;
        }

        return null;
    }

    public function getAnswers(Request $request)
    {
        // Validate the incoming request data
        $request->validate([
            'question_id' => 'required|integer|exists:service_questions,id',
        ]);

        // Fetch possible answers based on the provided question_id
        $answers = ServicePossibleAnswerModel::where('service_question_id', $request->question_id)->get();

        // Return the possible answers as a JSON response
        return response()->json($answers);
    }
    private function contactedLead($user_id,$lead_id)
    {
        $lead = ContactedLeadsModel::where('lead_id','=',$lead_id)->where('user_id','=',$user_id)->first();
    return $lead;
    }
    public function openContacts(Request $request)
    {
        try{
            $user = $request->user();
            $lead_id = (int)$request->lead_id;
            
            $profileController = new ProfileController();
            $lead = $profileController->getIndividualLead($lead_id);
            $credits = $lead->credits;
            $credits_balance = $user->credits_balance;
            $arr = [];
            
            if($credits_balance>=$credits)
            {
                $contacts_count=(int)$this->userResponse($lead_id);
                if($contacts_count <5)
                {
                $balance = $credits_balance - $credits;
                $user->credits_balance = $balance;
                $user->save();
                $description = "Hi,<br>
                My name is {$user->first_name}, and I have received your task via Fortai.<br> I would be happy to assist you with it.<br><br>
                Could we schedule a quick call to go over the details? <br>Please let me know a time that suits you best.<br><br>
                I look forward to hearing from you.";
                $lead = LeadsModel::where('id',$lead_id)->first();
                $trail = CreditsTrailModel::create(["user_id"=>$user->id,"lead_id"=>$lead_id,"credits"=>$credits,"entered_by"=>$user->id]);
                $note = LeadsNotesModel::create(["lead_id"=>$lead_id,"description"=>$description,"entered_by"=>$user->id,"user_id"=>$user->id,"comm_link"=>$lead->user_id."_".$user->id]);
                $arr = array("email"=>$lead->email,"contact_number"=>$lead->contact_number);
                $conl = $this->contactedLead($user->id,$lead_id);
                if($conl == false)
                {
                  $contacted = new ContactedLeadsModel();
                  $contacted->user_id=$user->id;
                  $contacted->lead_id=$lead_id;
                  $contacted->entered_by=$user->id;
                  $contacted->save(); 
                  //ContactedLeadsModel::create(["user_id"=>$user->id,"lead_id"=>$lead_id,"entered_by"=>$user->id]);

                  $user2 = User::find($lead->user_id);
                  $deviceToken = $user2->token; 
                  $desc = "My name is ".$user->first_name.", and I've received your task from Fortai. I'd be delighted to assist you with it.";
              $this->createPushNotification("New Lead contact", $desc, $deviceToken,"https://test.zbsburial.com/customer/dashboard");  
                    
                }                
                return response()->json(["message"=>"Okay","details"=>$arr,"button"=>$user->id."-".$lead_id],200);
            }
            else{
                LeadsModel::where('id', $lead_id)->update(["status" => "Unavailable"]);
                return response()->json(["message"=>"Not Allowed","content"=>"This Lead is unavailable"],200);
            }
            }
            else{
                $first_name = $lead->first_name;
                $templates = new TemplatesController();
                $modal_content = $templates->showSubscription($first_name,$credits,$credits_balance);
                return response()->json(["message"=>"No credits","content"=>$modal_content],200);
            }           


        }
        catch(Exception $e)
        {
            return response()->json(["message"=>"There is an error".$e->getMessage()],500);
        }
    }
    public function notInterested(Request $request)
    {
        try{
            $user = $request->user();
            $lead_id = (int)$request->lead_id;            
                $conl = $this->contactedLead($user->id,$lead_id);
                if($conl == false)
                {
                  $contacted = new ContactedLeadsModel();
                  $contacted->user_id=$user->id;
                  $contacted->lead_id=$lead_id;
                  $contacted->status="Not Interested";
                  $contacted->entered_by=$user->id;
                  $contacted->save();
                }
                return response()->json(["message"=>"Okay","details"=>$contacted,"button"=>$user->id."-".$lead_id],200);
            }        
        catch(Exception $e)
        {
            return response()->json(["message"=>"There is an error".$e->getMessage()],500);
        }
    }
    private function maskEmail($email) {
        list($localPart, $domainPart) = explode('@', $email);
        $maskedLocal = $localPart[0] . str_repeat('*', strlen($localPart) - 2) . $localPart[strlen($localPart) - 1];
        $domainParts = explode('.', $domainPart);
        $maskedDomain = $domainParts[0][0] . str_repeat('*', strlen($domainParts[0]) - 2) . $domainParts[0][strlen($domainParts[0]) - 1];
        $maskedEmail = $maskedLocal . '@' . $maskedDomain . '.' . $domainParts[1];    
        return $maskedEmail;
    }

    private function maskPhoneNumber($phoneNumber) {
        if (strlen($phoneNumber) < 10) {
            //return $phoneNumber; // If not, return the phone number as is
        }        
        $maskedPhone = substr($phoneNumber, 0, 3) . str_repeat('*', strlen($phoneNumber) - 3);
        
        return $maskedPhone;
    }

    public function goToEmail(Request $request)
{
    $user = $request->user();
    $end = false;
    $id = $request->id;
    $customer = new CustomerController();
    $lead_id = $customer->decryptNumber($id, "tenhg");
    $lead = LeadsModel::join('users as u', 'leads.user_id', '=', 'u.id')->where("leads.id",$lead_id)->first();
    $fullName = $user->first_name . " " . $user->last_name;
    $first_name = $lead->first_name;
    $message = "Hi $first_name,<br/><br/>I found your job on Fortai and wanted to reach out and say hello.<br/><br/>
                It looks like a perfect match for what I do - I'd love to help you make it happen. 
                Do you have time for a quick call today?<br/><br/>All the best,<br/><br/>" . $fullName;

    return view('leads.compose-email', compact("message", "end","id"));
}

    public function addLeadsTrail(Request $request)
    {
        try{
        $user = $request->user();
        $lead_id = (int)$request->lead_id;
        $trail_id =(int)$request->trail_id; 
        $fixed_trail = TrailsModel::where('id',$trail_id)->first();
        $description = $fixed_trail["trail"];
        $trail = LeadsTrailModel::create([
'lead_id'=>$lead_id, 
'user_id'=>$user->id, 
'description'=>$description, 
'entered_by'=>$user->id
        ]);
        return response()->json(['message'=>'Successfull added','trail'=>$trail,'trail_id'=>$trail_id,'status'=>true],200);
    }
    catch(Exception $e){
        return response()->json(['message'=>'There is an error : '.$e->getMessage(),'status'=>false],500);
    }
    }

    public function getLeadsTrail($lead_id,$user_id)
    {
        try{
        
        $trails = LeadsTrailModel::join('users as u','leads_trail.user_id','=','u.id')
        ->select('u.first_name','leads_trail.description','leads_trail.date_entered')        
        ->where('lead_id',$lead_id)->where('user_id',$user_id)->get();
        return $trails;
    }
    catch(Exception $e){
        return [];
    }
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
    
    $notes = LeadsNotesModel::join('users as u','lead_notes.user_id','=','u.id')
    ->join('leads as l','lead_notes.lead_id','=','l.id')
    ->join('master_services as m','l.service_id','=','m.id')
    ->select('u.first_name','lead_notes.description','m.service_name','lead_notes.date_entered','lead_notes.user_id', 'l.user_id as leads_user_id')        
    ->where(function($query) use ($comm_link, $comm_link_reverse) {
        $query->where('lead_notes.comm_link', $comm_link)
              ->orWhere('lead_notes.comm_link', $comm_link_reverse);
    })
    ->where('lead_notes.lead_id',$lead_id)->orderBy('lead_notes.id', 'asc')->get();
    return $notes;
}
catch(Exception $e){
    
    return [];
}
}

   

    public function getLeadServiceDetails($lead_id)
    {
        try{
        
        $details = LeadsServiceModel::where('lead_id',$lead_id)->first();
        return $details;
    }
    catch(Exception $e){
        
        return [];
    }
    }

    public function postNote(Request $request)
    {
        try{ 
            $lead_id = (int)$request->lead_id;
            $lead = LeadsModel::where('id',$lead_id)->first();
            $description = $request->description;
            $user = $request->user();            
            $user_id = $user->id;
            $first_id = 0;
            $second_id = 0;
            $unid =0;
            if(isset($request->contacted_user_id)){
                $first_id =  $user_id;    
                $second_id = (int)$request->contacted_user_id;  
                $unid =(int)$request->contacted_user_id;         
            }
            else
            {
                $first_id =  $lead->user_id;
                $second_id = $user_id; 
                $unid =$lead->user_id;
            }
           
            // Construct comm_link with smaller ID first (must match mobile API logic)
            $comm_link = ($first_id < $second_id) 
                ? $first_id . '_' . $second_id 
                : $second_id . '_' . $first_id;
            $user2 = User::find($unid);
            $deviceToken = $user2->token;
            
           // return ["lead_id"=>$lead_id,"description"=>$description,"entered_by"=>$user_id,"user_id"=>$user_id,"comm_link"=>$comm_link];
        
        $note = LeadsNotesModel::create(["lead_id"=>$lead_id,"description"=>$description,"entered_by"=>$user_id,"user_id"=>$user_id,"comm_link"=>$comm_link]);  
        $this->createPushNotification("New Lead message from ".$user->first_name, $description, $deviceToken,"https://test.zbsburial.com/responses");      
        return response()->json(["message"=>"Note Successfully added","note"=>$note, "date_entered" => date("Y-m-d H:i:s")],200);
    }
    catch(Exception $e){
        return response()->json(["message"=>"There is an error : ".$e->getMessage()],500);
    }
    }

    public function updateStatus(Request $request)
    {
        try{ 
            $user = $request->user();           
            $lead_id = (int)$request->lead_id;
            $status = $request->status;
            $lead = ContactedLeadsModel::where('lead_id','=',$lead_id)->where('user_id','=',$user->id)->first();
            $lead->status = $status;
            $lead->save();
        
         return response()->json(["message"=>"Lead updated successfully","lead"=>$lead],200);
    }
    catch(Exception $e){
        return response()->json(["message"=>"There is an error : ".$e->getMessage()],500);
    }
    }

    public function getLeadNotes(Request $request)
    {
        try{ 
            $user = $request->user();           
            $lead_id = (int)$request->lead_id;
            $contacted_user_id = (int)$request->contacted_user_id;
            $expertnotes = $this->getLeadsNotes($lead_id,$contacted_user_id);
            $u = User::find($contacted_user_id);
            $services = $user = UserServicesModel::where( 'user_id',$contacted_user_id)
            ->join("master_services as u","user_services.service_id","=","u.id")
            ->select("u.service_name")
            ->get();
           $templates = new TemplatesController();
           $customer = new CustomerController();
           $images = $customer->getImages($contacted_user_id);
           $ratings = $customer->getReviews($contacted_user_id);
           //$images = [];
           $profile_picture = $u->profile_picture;
           //$path = strlen($profile_picture)>5?Storage::url('uploads/'.$u->profile_picture):"https://www.w3schools.com/w3images/avatar2.png";
           $path = "https://www.w3schools.com/w3images/avatar2.png";
            $details = $templates->expertProfile($u->first_name." ".$u->last_name, $u->email, $u->contact_number, $services, $u->biography, $u->facebook, $u->twitter, $u->linkedin, $images, $ratings);
            

         return response()->json(["message"=>"Notes Received","expertnotes"=>$expertnotes, "details"=>$details,"xxx"=>$contacted_user_id,"profile_pic"=>$path,"name"=>$u->first_name." ".$u->last_name],200);
    }
    catch(Exception $e){
        return response()->json(["message"=>"There is an error : ".$e->getMessage()],500);
    }
    }

    public function updateEstimate(Request $request)
    {
        try{ 
            $user = $request->user();   
            $contacted_user_id = $user->id;        
            $lead_id = (int)$request->lead_id; 
            $estimate_amount = (double)$request->estimate_amount;
            $estimate_type = $request->estimate_type;
            $estimate_message = $request->respond_textarea_field;         
            $contacted_lead = ContactedLeadsModel::where("user_id", $contacted_user_id)
            ->where("lead_id", $lead_id)
            ->update([
                "estimate_amount" => $estimate_amount,
                "estimate_type" => $estimate_type,
                "estimate_message" => $estimate_message,
            ]);
            $lead = LeadsModel::find($lead_id);
        $description = "Hi, estimate sent for R".$estimate_amount." / ".$estimate_type;
        $note = LeadsNotesModel::create(["lead_id"=>$lead_id,"description"=>$description,"entered_by"=>$user->id,"user_id"=>$user->id,"comm_link"=>$lead->user_id."_".$user->id]);
        $user2 = User::find($lead->user_id);
        $deviceToken = $user2->token; 
    $this->createPushNotification("Estimate Received from ".$user->first_name, $description, $deviceToken,"https://test.zbsburial.com/responses");      
        $customer = new CustomerController();
            $customer->addLeadTrail($user->id, $lead_id,6);

         return response()->json(["message"=>"Lead Updated","status"=>"success","contacted_lead"=>$contacted_lead],200);
    }
    catch(Exception $e){
        return response()->json(["message"=>"There is an error : ".$e->getMessage(),"status"=>"error",],500);
    }
    }

    function postStatus(Request $request)
    {
        try{
        $lead_id = (int)$request->xl;
        $status = $request->status;
        $hired_expert_id = (int)$request->expert;
        $closed_description = $request->description;
        $user = $request->user();
        if($status == "hired")
        {
            $status = "Bought";
        }
        elseif($status == "unavailable")
        {
            $status = "Unavailable"; 
        }
        $details = ["status" => $status, 
        "hired_expert_id" => $hired_expert_id, 
        "closed_by" => $user->id,
        "date_closed" => date("Y-m-d H:i:s"),
        "closed_description" => $closed_description
        ];
      
       $updated_lead = LeadsModel::where('id',$lead_id)
       ->update($details);
    return redirect()->route('customer.dashboard')->with('status', 'updated_lead')->with('success', 'Lead updated successfully!');
   
} catch(Exception $e)
{
    return redirect()->route('customer.dashboard')->with('status', 'updated_lead')->with('error', 'No changes were made : '.$e->getMessage());
}

    }

    function leadExperts(Request $request)
    {
        try{
        $lead_id = $request->xl;        
        $user = $request->user();
        $xperts = ContactedLeadsModel::join('users', 'contacted_lead.user_id', '=', 'users.id')
        ->select('users.id', 'users.first_name', 'users.last_name')
        ->where('contacted_lead.lead_id', $lead_id)
        ->get();
    return response()->json(["message" => "Experts retrieved","xperts" => $xperts], 200);
} catch(Exception $e)
{
    return response()->json(["message" => "There is an error"], 500);
}

    }

    public function sendEmail(Request $request)
    {
        try {
            $user = $request->user();
            $request->validate([
                'editordata' => 'required|string'
            ]);
            $end = true;
            $customer = new CustomerController();
            $lead_id = $customer->decryptNumber($request->knn, "tenhg");
            $lead = LeadsModel::join('users as u', 'leads.user_id', '=', 'u.id')->where("leads.id",$lead_id)->first();
            $emailContent = $request->editordata;
            $recipientEmail = $lead->email; // Change to actual recipient
    
            Mail::send([], [], function ($message) use ($recipientEmail, $emailContent) {
                $message->to($recipientEmail)
                        ->subject("New Email from Fortai")
                        ->html($emailContent); // Correct way to send HTML content
            });
            
            $customer->addLeadTrail($user->id, $lead_id,1);
    
            $message = "Email sent successfully!";
            return view('leads.compose-email', compact("message", "end"));
    
        } catch (\Exception $e) {
            return redirect()->route('customersettings')
                ->with('status', 'fail-email')
                ->with('error', 'Failed to send email')
                ->with('end', false);
        }
    }
    
    public function getConversations(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'User not authenticated'
                ], 401);
            }

            // Get all leads this provider has contacted
            $contactedLeads = ContactedLeadsModel::where('user_id', $user->id)
                ->join('leads', 'contacted_lead.lead_id', '=', 'leads.id')
                ->join('master_services', 'leads.service_id', '=', 'master_services.id')
                ->join('users', 'leads.user_id', '=', 'users.id')
                ->select(
                    'leads.id as lead_id',
                    'leads.user_id as customer_id',
                    'leads.date_entered as lead_date',
                    'master_services.service_name',
                    'users.first_name',
                    'users.last_name',
                    'users.profile_picture',
                    'contacted_lead.date_entered as contacted_date'
                )
                ->orderBy('contacted_lead.date_entered', 'desc')
                ->get();

            $conversations = [];

            foreach ($contactedLeads as $contactedLead) {
                // Get the last note in this conversation
                $comm_link = ($user->id < $contactedLead->customer_id) 
                    ? $user->id . '_' . $contactedLead->customer_id 
                    : $contactedLead->customer_id . '_' . $user->id;
                $comm_link_reverse = ($user->id < $contactedLead->customer_id) 
                    ? $contactedLead->customer_id . '_' . $user->id 
                    : $user->id . '_' . $contactedLead->customer_id;

                $lastNote = LeadsNotesModel::where('lead_id', $contactedLead->lead_id)
                    ->where(function($query) use ($comm_link, $comm_link_reverse) {
                        $query->where('comm_link', $comm_link)
                              ->orWhere('comm_link', $comm_link_reverse);
                    })
                    ->orderBy('date_entered', 'desc')
                    ->first();

                // Get actual datetime for sorting
                $sortDateTime = null;
                if ($lastNote && $lastNote->date_entered) {
                    $sortDateTime = $lastNote->date_entered;
                } elseif ($contactedLead->contacted_date) {
                    $sortDateTime = $contactedLead->contacted_date;
                }

                $conversations[] = [
                    'lead_id'          => $contactedLead->lead_id,
                    'service_name'     => $contactedLead->service_name,
                    'customer_id'      => $contactedLead->customer_id,
                    'customer_name'   => $contactedLead->first_name . ' ' . $contactedLead->last_name,
                    'customer_avatar' => $contactedLead->profile_picture,
                    'last_message'     => $lastNote ? strip_tags($lastNote->description) : null,
                    'last_message_time'=> $lastNote ? $this->timeAgo($lastNote->date_entered) : null,
                    'last_message_datetime' => $lastNote ? $lastNote->date_entered : null,
                    'unread_count'     => 0,
                    'contacted_date'   => $this->timeAgo($contactedLead->contacted_date),
                    'sort_datetime'    => $sortDateTime,
                ];
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
    }

private function createPushNotification($title,$body,$deviceToken,$url)
{
    if(strlen($deviceToken)>9) 
    {
        try {
            FirebasePushNotification::sendNotification($title, $body, $deviceToken,$url); 
        } catch (\Exception $e) {
            \Log::error('Push notification failed: ' . $e->getMessage());
            // Don't throw the exception - just log it and continue
        }
    }
}
}