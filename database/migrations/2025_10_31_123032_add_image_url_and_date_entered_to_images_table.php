<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('images', function (Blueprint $table) {
            // Add image_url column if it doesn't exist
            if (!Schema::hasColumn('images', 'image_url')) {
                $table->string('image_url', 500)->nullable()->after('image_name');
            }
            
            // Add date_entered column if it doesn't exist
            if (!Schema::hasColumn('images', 'date_entered')) {
                $table->datetime('date_entered')->nullable()->after('entered_by');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('images', function (Blueprint $table) {
            // Remove columns if they exist
            if (Schema::hasColumn('images', 'image_url')) {
                $table->dropColumn('image_url');
            }
            
            if (Schema::hasColumn('images', 'date_entered')) {
                $table->dropColumn('date_entered');
            }
        });
    }
};
