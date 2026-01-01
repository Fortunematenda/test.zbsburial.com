<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Cache;
use App\Models\ServicesModel;
use App\Models\User;

/**
 * Helper class for centralized cache management
 */
class CacheHelper
{
    /**
     * Cache duration constants (in seconds)
     */
    const CACHE_TTL_SERVICES = 3600; // 1 hour - Services rarely change
    const CACHE_TTL_USER_PROFILE = 300; // 5 minutes - User profiles change more frequently
    const CACHE_TTL_USER_SERVICES = 600; // 10 minutes - User services change moderately

    /**
     * Get all services with caching
     * 
     * @param bool $forceRefresh Force refresh from database
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public static function getServices(bool $forceRefresh = false)
    {
        $cacheKey = 'all-services';
        
        if ($forceRefresh) {
            Cache::forget($cacheKey);
        }

        return Cache::remember($cacheKey, self::CACHE_TTL_SERVICES, function () {
            return ServicesModel::select('id', 'service_name', 'min_credits', 'max_credits')
                ->orderBy('service_name', 'asc')
                ->get();
        });
    }

    /**
     * Get service by name with caching
     * 
     * @param string $serviceName
     * @return \App\Models\ServicesModel|null
     */
    public static function getServiceByName(string $serviceName)
    {
        $cacheKey = "service-name-{$serviceName}";
        
        return Cache::remember($cacheKey, self::CACHE_TTL_SERVICES, function () use ($serviceName) {
            return ServicesModel::where('service_name', $serviceName)->first();
        });
    }

    /**
     * Get user profile with caching
     * 
     * @param int $userId
     * @param bool $forceRefresh Force refresh from database
     * @return \App\Models\User|null
     */
    public static function getUserProfile(int $userId, bool $forceRefresh = false)
    {
        $cacheKey = "user-profile-{$userId}";
        
        if ($forceRefresh) {
            Cache::forget($cacheKey);
        }

        return Cache::remember($cacheKey, self::CACHE_TTL_USER_PROFILE, function () use ($userId) {
            return User::with(['services'])->find($userId);
        });
    }

    /**
     * Clear user profile cache
     * 
     * @param int $userId
     * @return void
     */
    public static function clearUserProfile(int $userId): void
    {
        Cache::forget("user-profile-{$userId}");
    }

    /**
     * Clear all services cache
     * 
     * @return void
     */
    public static function clearServices(): void
    {
        Cache::forget('all-services');
        // Clear individual service caches if needed
        Cache::flush(); // In production, you might want to be more selective
    }

    /**
     * Clear all user-related caches
     * 
     * @param int $userId
     * @return void
     */
    public static function clearUserCaches(int $userId): void
    {
        self::clearUserProfile($userId);
        // Add other user-related cache keys here if needed
    }
}

