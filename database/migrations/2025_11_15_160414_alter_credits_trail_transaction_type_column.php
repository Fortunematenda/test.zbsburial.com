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
        Schema::table('credits_trail', function (Blueprint $table) {
            // Alter transaction_type column to be VARCHAR(50) to accommodate values like 'usage', 'purchase', 'adjustment'
            $table->string('transaction_type', 50)->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('credits_trail', function (Blueprint $table) {
            // Revert to original size if needed (adjust based on original schema)
            $table->string('transaction_type', 20)->nullable()->change();
        });
    }
};
