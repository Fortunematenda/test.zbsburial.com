<?php

namespace Tests\Feature\Api;

use App\Models\LeadsModel;
use App\Models\ServicesModel;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class LeadCreationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
    }

    public function test_authenticated_user_can_create_lead(): void
    {
        $user = User::factory()->create([
            'role' => 'Customer',
        ]);

        Sanctum::actingAs($user);

        // Create a service first
        $service = ServicesModel::create([
            'service_name' => 'Plumbing',
            'min_credits' => 500,
            'max_credits' => 2000,
        ]);

        $response = $this->postJson('/api/leads', [
            'description' => 'Need a plumber to fix my sink',
            'category' => $service->service_name,
            'budget' => 'R5000',
            'location' => 'Cape Town',
            'urgency' => 'Normal',
            'latitude' => -33.9249,
            'longitude' => 18.4241,
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'message',
                'data' => [
                    'lead' => [
                        'id',
                        'user_id',
                        'service_id',
                        'description',
                        'status',
                    ]
                ]
            ]);

        $this->assertDatabaseHas('leads', [
            'user_id' => $user->id,
            'description' => 'Need a plumber to fix my sink',
            'status' => 'Open',
        ]);
    }

    public function test_unauthenticated_user_cannot_create_lead(): void
    {
        $response = $this->postJson('/api/leads', [
            'description' => 'Test lead',
            'category' => 'Plumbing',
            'budget' => 'R5000',
            'location' => 'Cape Town',
            'urgency' => 'Normal',
            'latitude' => -33.9249,
            'longitude' => 18.4241,
        ]);

        $response->assertStatus(401);
    }

    public function test_lead_creation_requires_valid_description(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/leads', [
            'category' => 'Plumbing',
            'budget' => 'R5000',
            'location' => 'Cape Town',
            'urgency' => 'Normal',
            'latitude' => -33.9249,
            'longitude' => 18.4241,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['description']);
    }

    public function test_lead_creation_validates_urgency_values(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/leads', [
            'description' => 'Test lead',
            'category' => 'Plumbing',
            'budget' => 'R5000',
            'location' => 'Cape Town',
            'urgency' => 'InvalidUrgency',
            'latitude' => -33.9249,
            'longitude' => 18.4241,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['urgency']);
    }

    public function test_customer_cannot_exceed_daily_lead_limit(): void
    {
        $user = User::factory()->create([
            'role' => 'Customer',
        ]);

        Sanctum::actingAs($user);

        // Create a service
        $service = ServicesModel::create([
            'service_name' => 'Plumbing',
        ]);
        
        LeadsModel::create([
            'user_id' => $user->id,
            'service_id' => $service->id,
            'status' => 'Open',
            'date_entered' => now(),
            'description' => 'First lead',
        ]);
        
        LeadsModel::create([
            'user_id' => $user->id,
            'service_id' => $service->id,
            'status' => 'Open',
            'date_entered' => now(),
            'description' => 'Second lead',
        ]);

        $response = $this->postJson('/api/leads', [
            'description' => 'Third lead',
            'category' => 'Plumbing',
            'budget' => 'R5000',
            'location' => 'Cape Town',
            'urgency' => 'Normal',
            'latitude' => -33.9249,
            'longitude' => 18.4241,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'leads_limit',
            ]);
    }
}

