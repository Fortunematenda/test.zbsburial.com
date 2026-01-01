<?php

namespace Tests\Unit\Helpers;

use App\Helpers\CacheHelper;
use App\Models\ServicesModel;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class CacheHelperTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
    }

    public function test_get_services_caches_results(): void
    {
        // Create a service
        $service = ServicesModel::create([
            'service_name' => 'Plumbing',
        ]);

        // First call should query database
        $services1 = CacheHelper::getServices();
        $this->assertCount(1, $services1);

        // Clear database connection to force cache usage
        // Second call should use cache
        $services2 = CacheHelper::getServices();
        $this->assertCount(1, $services2);
        $this->assertEquals($service->id, $services2->first()->id);
    }

    public function test_get_service_by_name(): void
    {
        ServicesModel::create([
            'service_name' => 'Plumbing',
        ]);

        $service = CacheHelper::getServiceByName('Plumbing');

        $this->assertNotNull($service);
        $this->assertEquals('Plumbing', $service->service_name);
    }

    public function test_get_service_by_name_returns_null_for_nonexistent(): void
    {
        $service = CacheHelper::getServiceByName('NonexistentService');

        $this->assertNull($service);
    }

    public function test_get_user_profile_caches_results(): void
    {
        $user = User::factory()->create();

        $cachedUser = CacheHelper::getUserProfile($user->id);

        $this->assertNotNull($cachedUser);
        $this->assertEquals($user->id, $cachedUser->id);
    }

    public function test_clear_user_profile_clears_cache(): void
    {
        $user = User::factory()->create();

        // Cache the profile
        CacheHelper::getUserProfile($user->id);

        // Clear cache
        CacheHelper::clearUserProfile($user->id);

        // Verify cache is cleared
        $this->assertFalse(Cache::has("user_profile_{$user->id}"));
    }
}

