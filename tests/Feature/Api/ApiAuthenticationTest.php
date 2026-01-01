<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ApiAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_simple_login_with_valid_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
        ]);

        $response = $this->postJson('/api/simple-login', [
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'message',
                'data' => [
                    'user',
                    'token'
                ]
            ])
            ->assertJson([
                'status' => 'success',
            ]);
    }

    public function test_simple_login_with_invalid_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
        ]);

        $response = $this->postJson('/api/simple-login', [
            'email' => 'test@example.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'status' => 'error',
            ]);
    }

    public function test_simple_login_requires_email(): void
    {
        $response = $this->postJson('/api/simple-login', [
            'password' => 'password123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_simple_login_requires_password(): void
    {
        $response = $this->postJson('/api/simple-login', [
            'email' => 'test@example.com',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    public function test_simple_register_creates_user(): void
    {
        $response = $this->postJson('/api/simple-register', [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'contact_number' => '0712345678',
            'location' => 'Cape Town',
            'latitude' => '-33.9249',
            'longitude' => '18.4241',
            'role' => 'Customer',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'message',
                'data' => [
                    'user_id',
                    'otp_sent'
                ]
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'john@example.com',
            'first_name' => 'John',
            'last_name' => 'Doe',
        ]);
    }

    public function test_simple_register_requires_password_confirmation(): void
    {
        $response = $this->postJson('/api/simple-register', [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
            'password' => 'password123',
            'password_confirmation' => 'different',
            'contact_number' => '0712345678',
            'location' => 'Cape Town',
            'latitude' => '-33.9249',
            'longitude' => '18.4241',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'status' => 'error',
                'message' => 'Password confirmation does not match'
            ]);
    }

    public function test_simple_register_rejects_duplicate_email(): void
    {
        User::factory()->create([
            'email' => 'existing@example.com',
        ]);

        $response = $this->postJson('/api/simple-register', [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'existing@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'contact_number' => '0712345678',
            'location' => 'Cape Town',
            'latitude' => '-33.9249',
            'longitude' => '18.4241',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'duplicate',
            ]);
    }
}

