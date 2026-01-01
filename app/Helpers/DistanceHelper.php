<?php

namespace App\Helpers;

/**
 * Helper class for distance calculations using Haversine formula
 */
class DistanceHelper
{
    /**
     * Earth's radius in kilometers
     */
    const EARTH_RADIUS_KM = 6371;

    /**
     * Generate SQL for calculating distance using Haversine formula
     * 
     * @param float $userLat User's latitude
     * @param float $userLng User's longitude
     * @param string $tableLatColumn Column name for latitude (default: 'latitude')
     * @param string $tableLngColumn Column name for longitude (default: 'longitude')
     * @param string $alias Alias for the distance column (default: 'distance')
     * @return string Raw SQL expression for distance calculation
     */
    public static function getDistanceSql(
        float $userLat,
        float $userLng,
        string $tableLatColumn = 'latitude',
        string $tableLngColumn = 'longitude',
        string $alias = 'distance'
    ): string {
        // Ensure values are numeric and sanitized
        $userLat = (float) $userLat;
        $userLng = (float) $userLng;

        return "(
            " . self::EARTH_RADIUS_KM . " * acos(
                cos(radians({$userLat})) 
                * cos(radians({$tableLatColumn})) 
                * cos(radians({$tableLngColumn}) - radians({$userLng})) 
                + sin(radians({$userLat})) 
                * sin(radians({$tableLatColumn}))
            )
        ) AS {$alias}";
    }

    /**
     * Generate SQL for filtering by maximum distance
     * 
     * @param float $userLat User's latitude
     * @param float $userLng User's longitude
     * @param float $maxDistance Maximum distance in kilometers
     * @param string $tableLatColumn Column name for latitude (default: 'latitude')
     * @param string $tableLngColumn Column name for longitude (default: 'longitude')
     * @return string Raw SQL expression for distance filter
     */
    public static function getDistanceFilterSql(
        float $userLat,
        float $userLng,
        float $maxDistance,
        string $tableLatColumn = 'latitude',
        string $tableLngColumn = 'longitude'
    ): string {
        $userLat = (float) $userLat;
        $userLng = (float) $userLng;
        $maxDistance = (float) $maxDistance;

        return "(
            " . self::EARTH_RADIUS_KM . " * acos(
                cos(radians({$userLat})) 
                * cos(radians({$tableLatColumn})) 
                * cos(radians({$tableLngColumn}) - radians({$userLng})) 
                + sin(radians({$userLat})) 
                * sin(radians({$tableLatColumn}))
            )
        ) <= {$maxDistance}";
    }

    /**
     * Calculate distance between two points using Haversine formula
     * 
     * @param float $lat1 Latitude of first point
     * @param float $lng1 Longitude of first point
     * @param float $lat2 Latitude of second point
     * @param float $lng2 Longitude of second point
     * @return float Distance in kilometers
     */
    public static function calculateDistance(
        float $lat1,
        float $lng1,
        float $lat2,
        float $lng2
    ): float {
        // Convert degrees to radians
        $lat1Rad = deg2rad($lat1);
        $lng1Rad = deg2rad($lng1);
        $lat2Rad = deg2rad($lat2);
        $lng2Rad = deg2rad($lng2);

        // Haversine formula
        $dlat = $lat2Rad - $lat1Rad;
        $dlng = $lng2Rad - $lng1Rad;

        $a = sin($dlat / 2) ** 2 +
             cos($lat1Rad) * cos($lat2Rad) * sin($dlng / 2) ** 2;
        
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        
        return self::EARTH_RADIUS_KM * $c;
    }
}

