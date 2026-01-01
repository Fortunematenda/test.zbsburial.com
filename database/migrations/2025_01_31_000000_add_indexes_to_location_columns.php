<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Adds indexes on latitude and longitude columns for better query performance
     * when performing distance-based searches using the Haversine formula.
     * 
     * Note: Run this migration with caution in production. For large tables,
     * consider running during low-traffic periods.
     */
    public function up(): void
    {
        try {
            // Add indexes to users table for location-based queries
            if (Schema::hasTable('users') && Schema::hasColumn('users', 'latitude')) {
                Schema::table('users', function (Blueprint $table) {
                    // Add index on latitude for distance calculations
                    $table->index('latitude', 'idx_users_latitude');
                    // Add index on longitude for distance calculations
                    $table->index('longitude', 'idx_users_longitude');
                    // Add composite index for both latitude and longitude
                    // This helps when filtering by both coordinates together
                    $table->index(['latitude', 'longitude'], 'idx_users_location');
                });
            }
        } catch (\Exception $e) {
            // Index may already exist, continue
            \Log::warning('Could not add indexes to users table: ' . $e->getMessage());
        }

        try {
            // Add indexes to leads table for location-based queries
            if (Schema::hasTable('leads') && Schema::hasColumn('leads', 'latitude')) {
                Schema::table('leads', function (Blueprint $table) {
                    // Add index on latitude for distance calculations
                    $table->index('latitude', 'idx_leads_latitude');
                    // Add index on longitude for distance calculations
                    $table->index('longitude', 'idx_leads_longitude');
                    // Add composite index for both latitude and longitude
                    $table->index(['latitude', 'longitude'], 'idx_leads_location');
                });
            }
        } catch (\Exception $e) {
            // Index may already exist, continue
            \Log::warning('Could not add indexes to leads table: ' . $e->getMessage());
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('users')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropIndex('idx_users_latitude');
                $table->dropIndex('idx_users_longitude');
                $table->dropIndex('idx_users_location');
            });
        }

        if (Schema::hasTable('leads')) {
            Schema::table('leads', function (Blueprint $table) {
                $table->dropIndex('idx_leads_latitude');
                $table->dropIndex('idx_leads_longitude');
                $table->dropIndex('idx_leads_location');
            });
        }
    }

};

