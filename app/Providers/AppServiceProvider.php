<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
<<<<<<< HEAD
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Http;
=======
>>>>>>> c1459f2 (new)

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
<<<<<<< HEAD
        Schema::defaultStringLength(191);
        Http::macro('disableSslVerification', function () {
            return Http::withOptions([
                'verify' => false, // Disable SSL certificate verification
            ]);
        });
=======
        //
>>>>>>> c1459f2 (new)
    }
}
