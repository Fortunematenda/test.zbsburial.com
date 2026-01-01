<?php

namespace App\Helpers;

use App\Models\LeadsModel;
use App\Models\ContactedLeadsModel;

class RatingHelper
{
    public static function calculateCustomerRating($userId)
    {
        // Get total leads posted by customer
        $totalLeads = LeadsModel::where('user_id', $userId)->count();
        
        // Get total jobs hired (based on contacted_lead.status = 'Hired')
        $hiredJobs = ContactedLeadsModel::join('leads', 'contacted_lead.lead_id', '=', 'leads.id')
            ->where('leads.user_id', $userId)
            ->where('contacted_lead.status', 'Hired')
            ->count();
        
        // Calculate rating: hired_jobs / total_leads (as a percentage out of 100)
        if ($totalLeads === 0) {
            return 0; // No leads posted yet
        }
        
        $rating = ($hiredJobs / $totalLeads) * 100;
        
        // Return as rounded value out of 5 stars (scale 0-5)
        return round(($rating / 100) * 5, 1);
    }
}

