<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <!-- Preload Fonts -->
    <link rel="stylesheet" href="{{ asset('build/assets/css/uikit.min.css') }}">
    <link rel="preload" as="font" type="font/woff2" crossorigin="" href="{{ asset('build/assets/fonts/gordita-medium-webfont.woff2') }}">
    <link rel="preload" as="font" type="font/woff2" crossorigin="" href="{{ asset('build/assets/fonts/gordita-bold-webfont.woff2') }}">
    <link rel="preload" as="font" type="font/woff2" crossorigin="" href="{{ asset('build/assets/fonts/gordita-regular-webfont.woff2') }}">

    <!-- Stylesheets -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@4.4.1/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.css">
    
    <!-- Favicon -->
    <link rel="apple-touch-icon" sizes="180x180"  href="{{asset('build/assets/img/fortailogoicon.png')}}">
    <link rel="icon" type="image/png" sizes="16x16"  href="{{asset('build/assets/img/fortailogoicon.png')}}">
    <link rel="mask-icon"  href="{{asset('build/assets/img/fortailogoicon.png')}}" color="#5bbad5">
    <link rel="shortcut icon"  href="{{asset('build/assets/img/fortailogoicon.png')}}">
    
    <!-- Social Media Sharing -->
    <meta property="og:image" content="https://d1w7gvu0kpf6fl.cloudfront.net/img/frontend-v2/sharing-images/linkedin-cover.jpg">
    <meta property="twitter:image" content="https://d1w7gvu0kpf6fl.cloudfront.net/img/frontend-v2/sharing-images/linkedin-cover.jpg">

    <!-- Additional Fonts -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css">
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

    <!--Start of Tawk.to Script-->
   <!-- <script type="text/javascript">
        var Tawk_API = Tawk_API || {},
            Tawk_LoadStart = new Date();
        (function() {
            var s1 = document.createElement("script"),
                s0 = document.getElementsByTagName("script")[0];
            s1.async = true;
            s1.src = 'https://embed.tawk.to/67b3271e45f68c1909a69513/1ik9t1k3o';
            s1.charset = 'UTF-8';
            s1.setAttribute('crossorigin', '*');
            s0.parentNode.insertBefore(s1, s0);
        })();
    </script>-->
    <!--End of Tawk.to Script-->

    <!-- Scripts -->
    <script type="text/javascript" charset="utf-8" src="{{ asset('build/assets/js/jquery.min.js') }}"></script>
    <script type="text/javascript" charset="utf-8" src="{{ asset('build/assets/js/main.js') }}"></script>
    <script src="{{ asset('build/assets/js/signupsteps.js') }}"></script>
    <script src="{{ asset('build/assets/js/yoyoToast.umd.min.js') }}"></script>
    <script src="https://js.api.here.com/v3/3.1/mapsjs-core.js"></script>
    <script src="https://js.api.here.com/v3/3.1/mapsjs-service.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>
    <script src="{{ asset('build/assets/js/uikit-icons.min.js') }}"></script>
    <script src="{{ asset('build/assets/js/uikit.min.js') }}"></script>
      <!-- UIkit JS (if needed for other UIkit components) -->
      <script src="https://cdn.jsdelivr.net/npm/uikit@3.16.15/dist/js/uikit.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/uikit@3.16.15/dist/js/uikit-icons.min.js"></script>

    <link rel="stylesheet" href="{{ asset('build/assets/css/create.css') }}">
    <link rel="stylesheet" href="{{ asset('build/assets/css/5a8bc88891d37fb6.css') }}">
  
    <link rel="stylesheet" href="{{ asset('build/assets/css/css/createrequest1.css') }}">

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/css/intlTelInput.min.css" />

    <title>{{ config('app.name', 'Fortai') }}</title>

    <!-- Scripts -->
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>

<body class="font-sans antialiased">
    <div class="min-h-screen bg-gray-100">
       
        <!-- Page Heading -->
         @isset($header)
         <header class="bg-blue shadow">
            <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {{ $header }}
            </div>
        </header>
        @endisset
        
        <div class="bg-black">
            <div class="px-4">
                <div class="py-4 flex items-center justify-between">
                    <div class="relative cursor-pointer" tabindex="0" style="opacity: 1; will-change: auto; transform: none;">
                        <div class="max-w-12">
                            <div class=" w-full top-2 bottom-0 bg-[linear-gradient(to_right,#F87BFF,#FB92CF,#FFDD98,#C2F0B1,#2FD8FE)] blur-md"></div>
                            <a class="navbar-brand py-3" href="/profession/create">
                            <x-application-logo class="w-20 h-20 fill-current text-gray-500" />
                            </a>
                        </div>
                    </div>
                    <nav class="p-4 responsive-only">
                        <div class="flex justify-between items-center">
                            <div id="menu-button1" class="border border-white border-opacity-30 h-10 w-10 inline-flex justify-center items-center rounded-lg cursor-pointer ">
                                <svg id="menu-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="text-white">
                                    <path d="M3 12h18M3 6h18M3 18h18"></path>
                                </svg>
                                <svg id="close-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="text-white hidden">
                                    <path d="M18 6L6 18M6 6l12 12"></path>
                                </svg>
                            </div>
            
 

    <div uk-dropdown>
        <ul class="uk-nav uk-dropdown-nav">
        @auth
                    @if(session('temp_role') == "Expert")
                    @if(empty(auth()->user()->id_upload) || empty(auth()->user()->date_verified))
                    @else
                        <li class="nav-item text-grey-400 mb-2">
                            <a class="nav-link" href="/dashboard">Dashboard</a>
                        </li>
                        <li class="nav-item mb-2">
                            <a class="nav-link" href="/seller/dashboard/">Leads</a>
                        </li>
                        <li class="nav-item mb-2">
                            <a class="nav-link" href="/responses">My Responses</a>
                        </li>
    @endif
                    @else
                        <li class="nav-item mb-2">
                            <a class="nav-link" href="/customer/dashboard/">My Requests</a>
                        </li>
                        
                    @endif
                    <li class="nav-item mb-2">
                        @if(session('temp_role') == "Expert")
                            <a class="nav-link" href="{{ route('profile.edit') }}">Account Settings</a>
                        @else
                            <a class="nav-link" href="{{ route('customersettings') }}">Account Settings</a>
                        @endif
                    </li>
                    <li class="nav-item mb-2">
                        @if(session('temp_role') == "Expert")
                            <a class="nav-link" href="{{ route('customer.dashboard') }}">Switch To Customer</a>
                        @else
                            <a class="nav-link" href="{{ route('dashboard') }}">Switch to Expert</a>
                        @endif
                    </li>
                    <li class="nav-item mb-2">
                        <a class="nav-link" href="/help">Help</a>
                    </li>
                        <li class="nav-item mb-2">
                            <form method="POST" action="{{ route('logout') }}">
                                @csrf
                                <a style="color: red !important;" class="nav-link"
                                   onclick="event.preventDefault(); this.closest('form').submit();">
                                    {{ __('Log Out') }}
                                </a>
                            </form>
                        </li>
                    @endauth
        @guest
        @if (Request::is('profession/create'))
        <li class="uk-active"><a href="/customer/createrequests/">Looking for services</a></li>
        <li class="uk-active"><a href="/login">Login</a></li>

        @elseif (Request::is('customer/createrequests') || Request::is('/'))
        <li class="uk-active"><a href="/profession/create"> Join As Pro</a></li>
        <li class="uk-active"><a href="/login">Login</a></li>
        @elseif (Request::is('login'))
    <li class="uk-active"><a href="/customer/createrequests/">Looking for services</a></li> 
    <li class="uk-active"><a href="/profession/create"> Join As Pro</a></li>
 
    @endif
    @endguest


        </ul>
        </div>
       
                </div>




                    </nav>
                  
      
                    <nav class="list-items-nav gap-6 items-center hidden" id="desktop-nav" >
                         @auth
                         <div>                         
                            @if(session('temp_role') == "Expert")
                    @if(empty(auth()->user()->id_upload) || empty(auth()->user()->date_verified))
                    @else
                    <div style="display: flex; gap: 20px;">
                            <a class="nav-link" href="/dashboard">Dashboard</a>
                            <a class="nav-link" href="/seller/dashboard/">Leads</a>
                            <a class="nav-link" href="/responses">My Responses</a>
                            </div>
    @endif
                    @else
                    <div style="display: flex; gap: 20px;">
                    <div><a class="nav-link" href="/customer/dashboard">
                      Dashboard 
                      <span class="underline"></span>
                    </a>
                  </div>
                    <div>
                      <a class="nav-link" href="/customer/dashboard/">
                        My Requests <span class="underline"></span>
                      </a></div>
                      </div>
                    @endif
                        </div>
                        <form method="POST" action="{{ route('logout') }}">
                                @csrf
                                <a class="nav-link"
                                   onclick="event.preventDefault(); this.closest('form').submit();">
                                    {{ __('Log Out') }}
                                </a>
                            </form>
                        @endauth
                        @guest
                        @if (Request::is('profession/create'))
                        <div>
                        
                        <a class="nav-link" href="/customer/createrequests">
                                Looking for services
                                <span class="underline"></span>
                            </a>
                            
                        </div>
                        <div>
                            <a class="nav-link" href="/login">
                                Login
                                <span class="underline"></span>
                            </a>
                        </div>
                        @elseif (Request::is('customer/createrequests') || Request::is('/'))
                        <div>
                      
                        <a class="nav-link" href="/profession/create">
                                Join As a Pro
                                <span class="underline"></span>
                            </a>
                           
                        </div>
                        <div>
                            <a class="nav-link" href="/login">
                                Login
                                <span class="underline"></span>
                            </a>
                        </div>
                        @elseif (Request::is('login'))
                        <div>
                        
                        <a class="nav-link" href="/customer/createrequests">
                                Looking for services
                                <span class="underline"></span>
                            </a>
                            
                        </div>
                        <div>
                      
                        <a class="nav-link" href="/profession/create">
                                Join As a Pro
                                <span class="underline"></span>
                            </a>
                           
                        </div>
                        @endif
                        @endguest
                    </nav>
                </div>
            </div>
        </div>
        <!-- Page Content -->
        <div>
            {{ $slot }}
        </div>
    </div>
</body>
</html>
<style>
  /* Base styles for nav links */
  .nav-link {
      position: relative;
      color: rgba(255, 255, 255, 0.81);
      text-decoration: none;
      transition: color 0.3s ease;
  }

  .nav-link:hover {
    color: #0f6ecd;
    
  }

  .nav-link .underline {
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 0;
      height: 2px;
      background-color: #0f6ecd;
      transition: width 0.3s ease;
  }

  .nav-link:hover .underline {
      width: 100%;
  }

  /* Initially hide the desktop nav (if using a mobile toggle elsewhere) */
  #desktop-nav {
      display: none;
  }

  /* Media query for larger screens (desktop) */
  @media (min-width: 768px) {
      #desktop-nav {
          display: flex; /* Display as flex container */
      }
  }
  /* Default styles */
  #menu {
        display: none;
    }

    /* Show the menu when the toggle button is clicked */
    #menu.show {
        display: block;
        background-color: #1f2937;
    }

    /* Responsive design: show menu inline for larger screens */
    @media (min-width: 768px) {
        #menu {
            display: flex;
            gap: 10px;
            justify-content: flex-end;
        }
        #menu a {
            display: inline-block;
            padding: 10px 15px;
            background: none;
        }
        #menu-button {
            display: none; /* Hide the menu button on larger screens */
        }
    }
    /* By default, the element is visible */
.responsive-only {
  display: inline-flex;
}

/* On larger screens (desktop), hide the element */
@media (min-width: 768px) {
  .responsive-only {
    display: none;
  }
}

@keyframes marquee {
    0% {
      transform: translateX(100%);
    }
    100% {
      transform: translateX(-100%);
    }
  }

  .marquee {
    animation: marquee 20s linear infinite;
    animation-delay: 0s; /* Start immediately */
    /* Do not preserve the end state between page loads */
    animation-fill-mode: forwards;
    will-change: transform;
  }
</style>
<script>
    document.getElementById('menu-button').addEventListener('click', function() {
        document.getElementById('menu').classList.toggle('show');
        document.getElementById('menu-icon').classList.toggle('hidden');
        document.getElementById('close-icon').classList.toggle('hidden');
    });
</script>

<style>
        /* Marquee container */
        .marquee-container {
            width: 100%;
            overflow: hidden;
            white-space: nowrap;
            position: relative;
            background: black;
            padding: 10px 0;
        }

        /* Marquee inner wrapper */
        .marquee-content {
            display: flex;
            gap: 40px; /* Adjust spacing between images */
            animation: scrollMarquee 20s linear infinite;
        }

        /* Marquee animation */
        @keyframes scrollMarquee {
            from {
                transform: translateX(0);
            }
            to {
                transform: translateX(-50%);
            }
        }

        /* Image styles */
        .marquee-content img {
            height: 30px; /* Adjust image height */
            width: auto;
        }
        p {
    font-size: 30px ;
    color: #ffffff ;
    margin-bottom: 20px !important;
}
    </style>
    <script>
        // Array of image sources
        const imageSources = [
            '/build/assets/img/bluedoglogo.png',
            '/build/assets/img/Genius.png',
            '/build/assets/img/LevelUp.png',
            '/build/assets/img/Scoutbird.png',
            '/build/assets/img/bluedoglogo.png',
            '/build/assets/img/Mobiosoft.png',
            '/build/assets/img/RocketDigital.png',
            '/build/assets/img/Shopido.png',
            '/build/assets/img/bluedoglogo.png',
            '/build/assets/img/Genius.png',
            '/build/assets/img/LevelUp.png',
            '/build/assets/img/Scoutbird.png',
            '/build/assets/img/bluedoglogo.png',
            '/build/assets/img/Mobiosoft.png',
            '/build/assets/img/RocketDigital.png',
            '/build/assets/img/Shopido.png'
            
        ];

        // Get the marquee content container
        const marqueeContent = document.getElementById('marqueeContent');

        // Loop through the imageSources array and create img elements
        imageSources.forEach(src => {
            // Create the image element
            const imgElement = document.createElement('img');
            imgElement.src = src;
            imgElement.alt = src.split('/').pop().split('.')[0] + " Logo"; // Set alt text from file name
            
            // Append the image to the marquee container
            marqueeContent.appendChild(imgElement);

           
        });
    </script>
    <style>
   

   .container-home {
       max-width: 600px;
       padding: 20px;
   }



   p {
       font-size: 20px;
       color: #1e1e1e;
       margin-bottom: 20px;
   }

 


   .popular {
       font-size: 0.9rem;
       color: #1e1e1e;
   }

   #regForm {
background-color: #ffffff;

font-family: Raleway;
padding: 40px;
width: 100%;
min-width: 300px;
}

.container3 {
width: 100%;
margin-right: auto;
margin-left: auto;
padding-right: 2rem;
padding-left: 2rem;
}
input {
padding: 10px;
width: 100%;
font-size: 17px;
font-family: Raleway;
border: 1px solid #aaaaaa;
}

/* Mark input boxes that gets an error on validation: */
input.invalid {
background-color: #ffdddd;
}

/* Hide all steps by default: */
.tab {
display: none;
}

button {
background-color: #04AA6D;
color: #ffffff;
border: none;
padding: 10px 20px;
font-size: 17px;
font-family: Raleway;
cursor: pointer;
}

button:hover {
opacity: 0.8;
}

#prevBtn {
background-color: #bbbbbb;
}


/* Make circles that indicate the steps of the form: */
.step {
height: 15px;
width: 15px;
margin: 0 2px;
background-color: purple;
border: none;  
border-radius: 50%;
display: inline-block;
opacity: 0.5;
}

.step.active {
opacity: 0.8;
}

/* Mark the steps that are finished and valid: */
.step.finish {
background-color: purple;
}
.uk-button-primary{
background-color:purple !important;
}
.hsd{
font-weight:bolder !important;
font-size:24px !important;
color:purple !important;
}
.hsd1{
font-size: 20px !important;
}
input[type=email], input[type=email], input[type=tel], input[type=text]{
border:1px solid lightgray;
}
label {
display: block !important;
}
.iti{
display: block !important;
}
.drop-area {
   width: 100%;
   max-width: 400px;
   padding: 20px;
   border: 2px dashed #a569bd;
   border-radius: 10px;
   text-align: center;
   cursor: pointer;
   color: #555;
   font-size: 18px;
}
.preview-container {
   display: flex;
   flex-wrap: wrap;
   margin-top: 10px;
   margin-bottom: 20px;
   border-bottom: 1px solid #e3c5e3;
}
.preview-image {
   border-radius: 5px;
}
.error {
color: red;
font-size: 12px;
margin-top: 5px;
display: block;
}

.search-box {
position: relative;
width: 100%;
max-width: 360px;
height: 60px;
border-radius: 120px;
margin: 0 auto;
}
.search-box1 {
position: relative;
width: 100%;
max-width: 360px;
height: 60px;
border-radius: 120px;
margin: 0 auto;
}
.search-icon, .go-icon {
position: absolute;
top: 0;
height: 60px;
width: 86px;
/* line-height: 61px; */
text-align: center;
}
.search-icon1, .go-icon {
position: absolute;
top: 0;
height: 60px;
width: 86px;
/* line-height: 61px;*/
text-align: center;
}
.search-icon {
left: 0;
pointer-events: none;
font-size: 1.22em;
will-change: transform;
transform: rotate(-45deg);
-webkit-transform: rotate(-45deg);
-moz-transform: rotate(-45deg);
-o-transform: rotate(-45deg);
transform-origin: center center;
-webkit-transform-origin: center center;
-moz-transform-origin: center center;
-o-transform-origin: center center;
transition: transform 400ms 220ms cubic-bezier(0.190, 1.000, 0.220, 1.000);
-webkit-transition: transform 400ms 220ms cubic-bezier(0.190, 1.000, 0.220, 1.000);
-moz-transition: transform 400ms 220ms cubic-bezier(0.190, 1.000, 0.220, 1.000);
-o-transition: transform 400ms 220ms cubic-bezier(0.190, 1.000, 0.220, 1.000);
}
.search-icon1 {
left: 0;
pointer-events: none;
font-size: 1.22em;
will-change: transform;
transform: rotate(-45deg);
-webkit-transform: rotate(-45deg);
-moz-transform: rotate(-45deg);
-o-transform: rotate(-45deg);
transform-origin: center center;
-webkit-transform-origin: center center;
-moz-transform-origin: center center;
-o-transform-origin: center center;
transition: transform 400ms 220ms cubic-bezier(0.190, 1.000, 0.220, 1.000);
-webkit-transition: transform 400ms 220ms cubic-bezier(0.190, 1.000, 0.220, 1.000);
-moz-transition: transform 400ms 220ms cubic-bezier(0.190, 1.000, 0.220, 1.000);
-o-transition: transform 400ms 220ms cubic-bezier(0.190, 1.000, 0.220, 1.000);
}
.si-rotate {
transform: rotate(0deg);
-webkit-transform: rotate(0deg);
-moz-transform: rotate(0deg);
-o-transform: rotate(0deg);
}
.go-icon {
right: 0;
pointer-events: none;
font-size: 1.38em;
will-change: opacity;
cursor: default;
opacity: 0;
transform: rotate(45deg);
-webkit-transform: rotate(45deg);
-moz-transform: rotate(45deg);
-o-transform: rotate(45deg);
transition: opacity 190ms ease-out, transform 260ms cubic-bezier(0.190, 1.000, 0.220, 1.000);
-webkit-transition: opacity 190ms ease-out, transform 260ms cubic-bezier(0.190, 1.000, 0.220, 1.000);
-moz-transition: opacity 190ms ease-out, transform 260ms cubic-bezier(0.190, 1.000, 0.220, 1.000);
-o-transition: opacity 190ms ease-out, transform 260ms cubic-bezier(0.190, 1.000, 0.220, 1.000);
}
.go-in {
opacity: 1;
pointer-events: all;
cursor: pointer;
transform: rotate(0);
-webkit-transform: rotate(0);
-moz-transform: rotate(0);
-o-transform: rotate(0);
transition: opacity 190ms ease-out, transform 260ms 20ms cubic-bezier(0.190, 1.000, 0.220, 1.000);
-webkit-transition: opacity 190ms ease-out, transform 260ms 20ms cubic-bezier(0.190, 1.000, 0.220, 1.000);
-moz-transition: opacity 190ms ease-out, transform 260ms 20ms cubic-bezier(0.190, 1.000, 0.220, 1.000);
-o-transition: opacity 190ms ease-out, transform 260ms 20ms cubic-bezier(0.190, 1.000, 0.220, 1.000);
}
.search-border {
display: block;
width: 100%;
max-width: 360px;
height: 60px;
}
.search-border1 {
display: block;
width: 100%;
max-width: 360px;
height: 60px;
}
.border {
fill: none;
stroke: #FFFFFF;
stroke-width: 5;
stroke-miterlimit: 10;
}
.border {
stroke-dasharray: 740;
stroke-dashoffset: 0;
transition: stroke-dashoffset 400ms cubic-bezier(0.600, 0.040, 0.735, 0.990);
-webkit-transition: stroke-dashoffset 400ms cubic-bezier(0.600, 0.040, 0.735, 0.990);
-moz-transition: stroke-dashoffset 400ms cubic-bezier(0.600, 0.040, 0.735, 0.990);
-o-transition: stroke-dashoffset 400ms cubic-bezier(0.600, 0.040, 0.735, 0.990);
}
.border-searching .border {
stroke-dasharray: 740;
stroke-dashoffset: 459;
transition: stroke-dashoffset 650ms cubic-bezier(0.755, 0.150, 0.205, 1.000);
-webkit-transition: stroke-dashoffset 650ms cubic-bezier(0.755, 0.150, 0.205, 1.000);
-moz-transition: stroke-dashoffset 650ms cubic-bezier(0.755, 0.150, 0.205, 1.000);
-o-transition: stroke-dashoffset 650ms cubic-bezier(0.755, 0.150, 0.205, 1.000);
}

.border1 {
fill: none;
stroke: #FFFFFF;
stroke-width: 5;
stroke-miterlimit: 10;
}
.border1 {
stroke-dasharray: 740;
stroke-dashoffset: 0;
transition: stroke-dashoffset 400ms cubic-bezier(0.600, 0.040, 0.735, 0.990);
-webkit-transition: stroke-dashoffset 400ms cubic-bezier(0.600, 0.040, 0.735, 0.990);
-moz-transition: stroke-dashoffset 400ms cubic-bezier(0.600, 0.040, 0.735, 0.990);
-o-transition: stroke-dashoffset 400ms cubic-bezier(0.600, 0.040, 0.735, 0.990);
}
.border-searching1 .border1 {
stroke-dasharray: 740;
stroke-dashoffset: 459;
transition: stroke-dashoffset 650ms cubic-bezier(0.755, 0.150, 0.205, 1.000);
-webkit-transition: stroke-dashoffset 650ms cubic-bezier(0.755, 0.150, 0.205, 1.000);
-moz-transition: stroke-dashoffset 650ms cubic-bezier(0.755, 0.150, 0.205, 1.000);
-o-transition: stroke-dashoffset 650ms cubic-bezier(0.755, 0.150, 0.205, 1.000);
}
#serviceTxt {
font-family: 'Montserrat Alternates', sans-serif;
position: absolute;
top: 0;
left: 0;
width: 100%;
height: 100%;
border-radius: 120px;
border: none;
background: rgba(255,255,255,0);
padding: 0 30px 0 50px;
color: #FFFFFF;
font-size: 1.32em;
font-weight: 400;
letter-spacing: -0.015em;
outline: none;
}
#serviceTxt::-webkit-input-placeholder {color: #FFFFFF;}
#serviceTxt::-moz-placeholder {color: #FFFFFF;}
#serviceTxt:-ms-input-placeholder {color: #FFFFFF;}
#serviceTxt:-moz-placeholder {color: #FFFFFF;}
#serviceTxt::-moz-selection {color: #FFFFFF; background: rgba(0,0,0,0.25);}
#serviceTxt::selection {color: #FFFFFF; background: rgba(0,0,0,0.25);}

#search1 {
font-family: 'Montserrat Alternates', sans-serif;
position: absolute;
top: 0;
left: 0;
width: 100%;
height: 100%;
border-radius: 120px;
border: none;
background: rgba(255,255,255,0);
padding: 0 30px 0 50px;
color: #FFFFFF;
font-size: 1.32em;
font-weight: 400;
letter-spacing: -0.015em;
outline: none;
}
#search1::-webkit-input-placeholder {color: #FFFFFF;}
#search1::-moz-placeholder {color: #FFFFFF;}
#search1:-ms-input-placeholder {color: #FFFFFF;}
#search1:-moz-placeholder {color: #FFFFFF;}
#search1::-moz-selection {color: #FFFFFF; background: rgba(0,0,0,0.25);}
#search1::selection {color: #FFFFFF; background: rgba(0,0,0,0.25);}

.text-white {
--tw-text-opacity: 1;

}
.py-\[72px\] {
padding-top: 30px;
padding-bottom: 72px;
}
.bg-\[linear-gradient\(to_bottom\2c \#000\2c \#200D42_34\%\2c \#4F21A1_65\%\2c \#A46EDB_82\%\)\] {
background-image: linear-gradient(180deg, #000, #200d42 34%, #4f21a1 65%, #a46edb 82%);
}
.bg-black {
--tw-bg-opacity: 1;
background-color: rgb(0 0 0 / var(--tw-bg-opacity));
}
.overflow-clip {
overflow: clip;
}
.relative {
position: relative;
}
.text-white\/70 {
color: hsla(0, 0%, 100%, .7);
}
.text-xl {
font-size: 2.25rem;
line-height: 2.5rem;
font-weight: 300;
}

.min-h-screen{min-height:0vh !important} 
.text-center {
text-align: center;
}

element.style {
will-change: transform;
transform: translateX(-45.1567%);
}

.search-btn {
display: inline-flex;
align-items: center;
padding: 10px 20px;
background-color: #fff;
color: #4f21a1;
border: none;
border-radius: 20px;
font-size: 22px;
cursor: pointer;
transition: background-color 0.3s ease;
font-weight: 500;
}

.search-btn i {
margin-right: 8px; /* Space between the icon and text */
}

.search-btn:hover {
background-color: #4f21a1; /* Lighter purple on hover */
color: white;
}

.search-btn:focus {
outline: none;
}

.search-btn:active {
background-color: #4a148c; /* Darker purple when clicked */
}
@media screen and (min-width: 1500px) {
#inner-service {   
width: 20% !important;
}

}
@media screen and (min-width: 768px) and (max-width: 1500px) {
#inner-service {   
width: 30% !important;
}
}
@media screen and (max-width: 768px) {
.search-btn {
display: flex;
justify-content: center;
align-items: center;
width: 60%;
margin: 0 auto;
text-align: center;
}
#inner-service {   
width: 95% !important;
}
.btn-main{
width: 100%;
}
h1{
font-size: 50px !important;
text-align: center !important;
font-weight: 700 !important;
color:rgb(255, 255, 255) !important;
margin-bottom: 10px !important; 
   
}
}
.txtclas{
font-size: 24px;
       font-weight: bold;;
       white-space: nowrap;
       overflow: hidden;
       width: 25ch;
       text-align: center;
       min-height: 1.2em;
       
}
#text{
min-height: 1.2em;
}

</style>
