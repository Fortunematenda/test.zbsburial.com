<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Adds indexes on frequently queried columns to improve query performance.
     * 
     * Note: Run this migration with caution in production. For large tables,
     * consider running during low-traffic periods.
     */
    public function up(): void
    {
        try {
            // Add indexes to leads table
            if (Schema::hasTable('leads')) {
                Schema::table('leads', function (Blueprint $table) {
                    // Index on status - frequently used in WHERE clauses
                    if (!$this->hasIndex('leads', 'status')) {
                        $table->index('status', 'idx_leads_status');
                    }
                    
                    // Index on user_id - foreign key used in joins
                    if (!$this->hasIndex('leads', 'user_id')) {
                        $table->index('user_id', 'idx_leads_user_id');
                    }
                    
                    // Index on service_id - foreign key used in joins
                    if (!$this->hasIndex('leads', 'service_id')) {
                        $table->index('service_id', 'idx_leads_service_id');
                    }
                    
                    // Composite index for common query pattern: status + user_id
                    if (!$this->hasIndex('leads', ['status', 'user_id'])) {
                        $table->index(['status', 'user_id'], 'idx_leads_status_user');
                    }
                    
                    // Composite index for service queries: status + service_id
                    if (!$this->hasIndex('leads', ['status', 'service_id'])) {
                        $table->index(['status', 'service_id'], 'idx_leads_status_service');
                    }
                });
            }
        } catch (\Exception $e) {
            // Index may already exist, continue
            \Log::warning('Could not add indexes to leads table: ' . $e->getMessage());
        }

        try {
            // Add indexes to contacted_lead table
            if (Schema::hasTable('contacted_lead')) {
                Schema::table('contacted_lead', function (Blueprint $table) {
                    // Index on lead_id - foreign key used in joins
                    if (!$this->hasIndex('contacted_lead', 'lead_id')) {
                        $table->index('lead_id', 'idx_contacted_lead_lead_id');
                    }
                    
                    // Index on user_id - foreign key used in joins
                    if (!$this->hasIndex('contacted_lead', 'user_id')) {
                        $table->index('user_id', 'idx_contacted_lead_user_id');
                    }
                    
                    // Composite index for common query: lead_id + user_id (unique lookup)
                    if (!$this->hasIndex('contacted_lead', ['lead_id', 'user_id'])) {
                        $table->index(['lead_id', 'user_id'], 'idx_contacted_lead_lead_user');
                    }
                    
                    // Index on status - used in filtering
                    if (Schema::hasColumn('contacted_lead', 'status') && !$this->hasIndex('contacted_lead', 'status')) {
                        $table->index('status', 'idx_contacted_lead_status');
                    }
                });
            }
        } catch (\Exception $e) {
            // Index may already exist, continue
            \Log::warning('Could not add indexes to contacted_lead table: ' . $e->getMessage());
        }

        try {
            // Ensure users.email has an index (should already exist as unique, but verify)
            if (Schema::hasTable('users') && Schema::hasColumn('users', 'email')) {
                // Email already has unique index from create_users_table migration
                // Just verify it exists
                \Log::info('users.email index verification skipped - unique constraint should already exist');
            }
        } catch (\Exception $e) {
            \Log::warning('Could not verify users.email index: ' . $e->getMessage());
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('leads')) {
            Schema::table('leads', function (Blueprint $table) {
                $table->dropIndex('idx_leads_status');
                $table->dropIndex('idx_leads_user_id');
                $table->dropIndex('idx_leads_service_id');
                $table->dropIndex('idx_leads_status_user');
                $table->dropIndex('idx_leads_status_service');
            });
        }

        if (Schema::hasTable('contacted_lead')) {
            Schema::table('contacted_lead', function (Blueprint $table) {
                $table->dropIndex('idx_contacted_lead_lead_id');
                $table->dropIndex('idx_contacted_lead_user_id');
                $table->dropIndex('idx_contacted_lead_lead_user');
                
                if (Schema::hasColumn('contacted_lead', 'status')) {
                    $table->dropIndex('idx_contacted_lead_status');
                }
            });
        }
    }

    /**
     * Check if an index exists on a table
     * 
     * @param string $table
     * @param string|array $columns
     * @return bool
     */
    private function hasIndex(string $table, $columns): bool
    {
        try {
            $connection = Schema::getConnection();
            $database = $connection->getDatabaseName();
            
            if (is_array($columns)) {
                $indexName = 'idx_' . $table . '_' . implode('_', $columns);
            } else {
                $indexName = 'idx_' . $table . '_' . $columns;
            }

            $result = \DB::select(
                "SELECT COUNT(*) as count 
                 FROM information_schema.statistics 
                 WHERE table_schema = ? 
                 AND table_name = ? 
                 AND index_name = ?",
                [$database, $table, $indexName]
            );

            return isset($result[0]) && $result[0]->count > 0;
        } catch (\Exception $e) {
            // If we can't check, assume it doesn't exist (safer to try creating)
            return false;
        }
    }
};

