<?php

namespace App\Helpers;

use Carbon\Carbon;

class DateHelper
{
    /**
     * Get human-readable time ago string
     * 
     * Note: Laravel's Carbon has diffForHumans() which is recommended,
     * but this custom function provides mobile-friendly short format
     * 
     * @param string|Carbon $datetime
     * @return string
     */
    public static function timeAgo($datetime): string
    {
        // If Carbon instance, convert to DateTime
        if ($datetime instanceof Carbon) {
            $ago = $datetime;
            $now = Carbon::now();
        } else {
            try {
                $ago = new \DateTime($datetime);
                $now = new \DateTime();
            } catch (\Exception $e) {
                return 'just now';
            }
        }

        $totalSeconds = $now->getTimestamp() - $ago->getTimestamp();

        if ($totalSeconds < 0) {
            return 'just now';
        }
        if ($totalSeconds < 60) {
            return 'just now';
        }
        if ($totalSeconds < 3600) {
            $minutes = floor($totalSeconds / 60);
            return $minutes . 'm ago';
        }
        if ($totalSeconds < 86400) {
            $hours = floor($totalSeconds / 3600);
            return $hours . 'h ago';
        }
        if ($totalSeconds < 604800) {
            $days = floor($totalSeconds / 86400);
            return $days . 'd ago';
        }
        if ($totalSeconds < 2592000) {
            $weeks = floor($totalSeconds / 604800);
            return $weeks . 'w ago';
        }
        if ($totalSeconds < 31536000) {
            $months = floor($totalSeconds / 2592000);
            return $months . 'mo ago';
        }

        $years = floor($totalSeconds / 31536000);
        return $years . 'y ago';
    }
}

