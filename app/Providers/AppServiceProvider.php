<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Http;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Fix for older MySQL versions and string length
        Schema::defaultStringLength(191);

        // Custom macro to disable SSL verification for HTTP client
        Http::macro('disableSslVerification', function () {
            return Http::withOptions([
                'verify' => false,
            ]);
        });
    }
}
