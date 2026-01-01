<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\LeadsModel;
use Illuminate\Support\Facades\DB;

class LeadController extends Controller
{
    public function getLeads(Request $request)
    {
        // Retrieve the authenticated user ID
        $user_id = auth()->user()->id;

        // Get the current page or set default to 1
        $page = $request->input('page', 1);
        $perPage = 5; // Number of records per page
        $offset = ($page - 1) * $perPage;

        // Base query
        $query = LeadsModel::join('user_services as u', 'leads.service_id', '=', 'u.service_id')
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
                's.location',
                's.is_phone_verified',
                'leads.urgent',
                'leads.credits',
                'leads.hiring_decision',
                DB::raw('(
                    6371 * ACOS(
                        COS(RADIANS(s.latitude)) 
                        * COS(RADIANS(leads.latitude)) 
                        * COS(RADIANS(leads.longitude) - RADIANS(s.longitude)) 
                        + SIN(RADIANS(s.latitude)) 
                        * SIN(RADIANS(leads.latitude))
                    )
                ) AS distance')
            )
            ->where('u.user_id', $user_id)
            ->where('leads.status', '=', 'Open')
            ->whereNotIn('leads.id', function ($subQuery) use ($user_id) {
                $subQuery->select('lead_id')
                         ->from('contacted_lead')
                         ->where('user_id', $user_id);
            })
            ->havingRaw('distance <= 20')  // Only include leads within 20km
            ->orderBy('leads.id', 'desc');

        // Clone the query to get the total count
        $countQuery = clone $query;
        $total = $countQuery->count();

        // Apply limit and offset for pagination
        $leads = $query->skip($offset)->take($perPage)->get();

        // Return JSON response
        return response()->json([
            'data' => $leads,
            'current_page' => $page,
            'per_page' => $perPage,
            'total' => $total,
            'last_page' => ceil($total / $perPage)
        ]);
    }
}
