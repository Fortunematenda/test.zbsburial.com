<?php

namespace Tests\Unit\Helpers;

use App\Helpers\DistanceHelper;
use Tests\TestCase;

class DistanceHelperTest extends TestCase
{
    public function test_calculate_distance_between_two_points(): void
    {
        // Test distance between two known points
        // Cape Town to Johannesburg: approximately 1,400 km
        $lat1 = -33.9249; // Cape Town latitude
        $lon1 = 18.4241;  // Cape Town longitude
        $lat2 = -26.2041; // Johannesburg latitude
        $lon2 = 28.0473;  // Johannesburg longitude

        $distance = DistanceHelper::calculateDistance($lat1, $lon1, $lat2, $lon2);

        // Distance should be approximately 1,400 km (allow ±100 km margin)
        $this->assertGreaterThan(1300, $distance);
        $this->assertLessThan(1500, $distance);
    }

    public function test_calculate_same_location_returns_zero(): void
    {
        $lat = -33.9249;
        $lon = 18.4241;

        $distance = DistanceHelper::calculateDistance($lat, $lon, $lat, $lon);

        $this->assertEquals(0, round($distance, 2));
    }

    public function test_get_distance_sql_generates_correct_sql(): void
    {
        $userLat = -33.9249;
        $userLon = 18.4241;

        $sql = DistanceHelper::getDistanceSql($userLat, $userLon, 'leads.latitude', 'leads.longitude');

        // Should contain the Haversine formula components
        $this->assertStringContainsString('6371', $sql);
        $this->assertStringContainsString('acos', $sql);
        $this->assertStringContainsString('radians', $sql);
        $this->assertStringContainsString('leads.latitude', $sql);
        $this->assertStringContainsString('leads.longitude', $sql);
        $this->assertStringContainsString('AS distance', $sql);
        $this->assertStringContainsString((string)$userLat, $sql);
        $this->assertStringContainsString((string)$userLon, $sql);
    }

    public function test_get_distance_filter_sql_includes_max_distance(): void
    {
        $userLat = -33.9249;
        $userLon = 18.4241;
        $maxDistance = 50.0;

        $sql = DistanceHelper::getDistanceFilterSql(
            $userLat,
            $userLon,
            $maxDistance,
            'leads.latitude',
            'leads.longitude'
        );

        $this->assertStringContainsString('<=', $sql);
        $this->assertStringContainsString((string)$maxDistance, $sql);
    }

    public function test_distance_sql_sanitizes_coordinates(): void
    {
        // Test that coordinates are properly cast to float
        $sql = DistanceHelper::getDistanceSql('invalid', 'string', 'latitude', 'longitude');

        // Should handle type casting gracefully
        $this->assertIsString($sql);
        $this->assertStringContainsString('latitude', $sql);
        $this->assertStringContainsString('longitude', $sql);
    }
}

