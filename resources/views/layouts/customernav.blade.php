<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <!-- Preload Fonts -->
    <link rel="preload" as="font" type="font/woff2" crossorigin="" href="{{asset('build/assets/fonts/gordita-medium-webfont.woff2')}}">
    <link rel="preload" as="font" type="font/woff2" crossorigin="" href="{{asset('build/assets/fonts/gordita-bold-webfont.woff2')}}">
    <link rel="preload" as="font" type="font/woff2" crossorigin="" href="{{asset('build/assets/fonts/gordita-regular-webfont.woff2')}}">

    <!-- Stylesheets -->
    <link rel="stylesheet" href="{{asset('build/assets/css/main.css')}}">
    <link rel="stylesheet" href="{{asset('build/assets/css/main.9be759a28ac54caa.css')}}">
    <link rel="stylesheet" href="{{asset('build/assets/css/uikit.min.css')}}">
    <link rel="stylesheet" href="{{asset('build/assets/css/buyer.css')}}">
    <link rel="stylesheet" href="{{asset('build/assets/css/settings.css')}}">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@4.4.1/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.css">
    <link rel="stylesheet" href="{{asset('build/assets/css/select2.min.css')}}">
    <link onerror="window?.fallbackOnError?.call(this, 'seller_dashboard');" rel="stylesheet" href="{{asset('build/assets/css/main.6dd4d89d0b4fea95.css')}}">
    <link rel="stylesheet" href="{{asset('build/assets/css/main_v2-built.645e5822f3.v2.css')}}">
    <link rel="stylesheet" href="{{asset('build/assets/css/main_v2-built.87872c72ad.v2')}}">
    <link rel="stylesheet" href="{{asset('build/assets/css/Marin-Icons.css')}}">
    

    <!-- Favicon -->
    <link rel="apple-touch-icon" sizes="180x180" href="https://d1w7gvu0kpf6fl.cloudfront.net/images/favicon/20190628/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="16x16" href="https://d1w7gvu0kpf6fl.cloudfront.net/images/favicon/20190628/favicon-16x16.png">
    <link rel="mask-icon" href="https://d1w7gvu0kpf6fl.cloudfront.net/images/favicon/20190628/safari-pinned-tab.svg" color="#5bbad5">
    <link rel="shortcut icon" href="https://d1w7gvu0kpf6fl.cloudfront.net/images/favicon/20190628/favicon.ico">

    <!-- Social Media Sharing -->
    <meta property="og:image" content="https://d1w7gvu0kpf6fl.cloudfront.net/img/frontend-v2/sharing-images/linkedin-cover.jpg">
    <meta property="twitter:image" content="https://d1w7gvu0kpf6fl.cloudfront.net/img/frontend-v2/sharing-images/linkedin-cover.jpg">

    <!-- Additional Fonts -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css">
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

    <title>{{ config('app.name', 'Fortai') }}</title>

    <!-- Scripts -->
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>

<body class="font-sans antialiased">
    <div class="min-h-screen bg-gray-100">
        @include('layouts.customer')

        <!-- Page Heading -->
        @isset($header)
        <header class="bg-blue shadow">
            <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {{ $header }}
            </div>
        </header>
        @endisset

        <!-- Page Content -->
        <main>
            {{ $slot }}
        </main>
    </div>

    <!-- Scripts -->
    <script type="text/javascript" charset="utf-8" src="{{asset('build/assets/js/jquery.min.js')}}"></script>
    <script type="text/javascript" charset="utf-8" src="{{asset('build/assets/js/main.js')}}"></script>
    <script src="{{asset('build/assets/js/signupsteps.js')}}"></script>
    <script src="{{asset('build/assets/js/yoyoToast.umd.min.js')}}"></script>
    <script src="https://js.api.here.com/v3/3.1/mapsjs-core.js"></script>
    <script src="https://js.api.here.com/v3/3.1/mapsjs-service.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>
    <script src="{{asset('build/assets/js/uikit-icons.min.js')}}"></script>
    <script src="{{asset('build/assets/js/uikit.min.js')}}"></script>
</body>

</html>
