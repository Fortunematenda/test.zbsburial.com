<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('subscribed_services_notifications')->default(false);
            $table->boolean('new_leads_notifications')->default(false);
            $table->boolean('weekly_newsletter_notifications')->default(false);
            $table->boolean('sms_notifications')->default(false);
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'subscribed_services_notifications',
                'new_leads_notifications',
                'weekly_newsletter_notifications',
                'sms_notifications'
            ]);
        });
    }
};

