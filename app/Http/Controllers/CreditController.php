<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\ServicesModel;
use App\Models\ContactedLeadsModel;
use App\Models\UserServicesModel;
use App\Models\LeadsModel;
use App\Models\User;
use App\Models\CreditsTrailModel; // Correct model import

class CreditController extends Controller
{
    public function buyCredits(Request $request)
    {
        $userId = $request->input('userId');
        $creditsToBuy = $request->input('creditsToBuy');

        // Fetch the user by ID
        $user = User::find($userId);

        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        // Update the user's credits (handle null for new users)
        $user->credits_balance = ($user->credits_balance ?? 0) + $creditsToBuy;
        $user->save();

        // Record the credit transaction in the credits table
        $trail = CreditsTrailModel::create(["user_id"=>$user->id,"lead_id"=>0,"credits"=>$creditsToBuy,"entered_by"=>$user->id]);
               

        // Return the updated credits
        return response()->json(['credits' => $user->credits_balance,]);
    }



  
}
