<x-guest-layout>
<x-auth-session-status class="mb-4" :status="session('status')" />
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width">
    <title>Login - Fortai</title>
    <link rel="stylesheet" href="{{asset('build/assets/css/5a8bc88891d37fb6.css')}}">
    
    <style>
        @font-face {
            font-family: 'NotoSans_online_security';
            src: url(chrome-extension://llbcnfanfmjhpedaedhbcnpgeepdnnok/assets/fonts/noto-sans-regular.woff);
        }
        @font-face {
            font-family: 'NotoSans_medium_online_security';
            src: url(chrome-extension://llbcnfanfmjhpedaedhbcnpgeepdnnok/assets/fonts/noto-sans-medium.ttf);
        }
        @font-face {
            font-family: 'NotoSans_bold_online_security';
            src: url(chrome-extension://llbcnfanfmjhpedaedhbcnpgeepdnnok/assets/fonts/noto-sans-bold.woff);
        }
        @font-face {
            font-family: 'NotoSans_semibold_online_security';
            src: url(chrome-extension://llbcnfanfmjhpedaedhbcnpgeepdnnok/assets/fonts/noto-sans-semibold.ttf);
        }
    </style>
    
    <style>
        .logo-container {
            display: flex;
            justify-content: center;
            align-items: center;
            text-align: center;
            margin-bottom: 30px;
        }
        .logo-container img {
            width: 80px;
        }
        .border-\[rgba\(255\2c 255\2c 255\2c \.2\)\] {
    border-color: hsl(0deg 0% 100% / 45%) !important;
    padding: 30px
}
    </style>
</head>

<body class="antialiased">
    <div id="__next">
        <div class="bg-black text-white bg-[linear-gradient(to_bottom,#000,#200D42_34%,#4F21A1_65%,#A46EDB_82%)] 
            relative overflow-clip h-full min-h-[100vh]" style="opacity: 1; will-change: auto;">
            
            <div class="stars absolute top-0 left-0 w-full h-[900px]" style="opacity: 1; will-change: auto;"></div>
            
            <div class="absolute h-[375px] w-[750px] sm:w-[1536px] sm:h-[768px] lg:w-[2400px] lg:h-[1200px] 
                rounded-[100%] bg-black left-1/2 -translate-x-1/2 border border-[#B48CDE] 
                bg-[radial-gradient(closest-side,#000_82%,#9560EB)] top-[calc(100%-96px)] sm:top-[calc(100%-120px)]">
            </div>

                    <div class="h-full w-full min-h-[100vh] flex justify-center items-center">
                        <div class="w-[350px] md:w-[420px] bg-transparent border border-[rgba(255,255,255,.2)] 
                                    backdrop-blur-[20px] shadow-[0_0_10px_rgba(0,0,0,.2)] text-white rounded-[10px] 
                                    px-8 py-8 mt-8 mb-8 space-y-6" style="opacity: 1; will-change: auto; transform: none;">
                                   
                       <form method="POST" action="{{ route('login') }}">
                                    @csrf
                            <h1 class="text-4xl text-center">Login</h1>

                            <div class="relative mt-6 flex justify-center items-center">
                            <div class="bg-white h-[1px] w-[18%] md:w-[25%]"></div>
                                <div class="relative text-sm leading-5 px-2 text-white">
                                    login with your email
                                </div>
                                <div class="bg-white h-[1px] w-[18%] md:w-[25%]"></div>
                            </div>

                            {{-- Email --}}
                            <div class="w-full h-[50px] [margin:30px_0]">
                      
                        <x-text-input id="email" type="email" name="email" :value="old('email')" required autofocus autocomplete="username"  placeholder="Email" autocomplete="username" 
                                class="h-full w-full bg-transparent outline-none border-2 border-solid 
                                border-[rgba(255,255,255,.2)] [border-radius:40px] text-[16px] text-white 
                                [padding:20px_45px_20px_20px] placeholder:text-white"/>
                                <x-input-error :messages="$errors->get('email')" class="mt-2" />
                        </div>
                        <div class="w-full h-[50px] [margin:30px_0]">
                        
                        <x-text-input id="password" type="password" name="password" placeholder="Password" autocomplete="current-password" 
                            class="h-full w-full bg-transparent outline-none border-2 border-solid 
                            border-[rgba(255,255,255,.2)] [border-radius:40px] text-[16px] text-white 
                            [padding:20px_45px_20px_20px] placeholder:text-white"/>
                            <x-input-error :messages="$errors->get('password')" class="mt-2" />
                    </div>
             

    
                    
                    <div class="flex justify-end [margin-bottom:15px] text-[14.5px] [margin-top:15px]">
                    @if (Route::has('password.request'))
                        <a class="text-white [text-decoration:none] hover:[text-decoration:underline]" 
                            href="{{ route('password.request') }}">{{ __('Forgot your password?') }}</a>
                            @endif
                    </div>

                    <button type="submit" 
                            class="w-full h-[45px] bg-white border-none outline-none rounded-full shadow-[0_0_10px_rgba(0,0,0,.1)] 
                            cursor-pointer text-base text-[#333] [font-weight:600] flex items-center justify-center">
                            {{ __('Log in') }}
                        </button>
<!--
                            <p class="text-sm text-gray-500 text-center mt-4">
                                By logging in you accept and agree to our
                                <a class="underline underline-offset-1 hover:underline-offset-2 transition-all" href="#">
                                    terms and conditions
                                </a>.
                            </p>
                            -->

                            {{-- Footer Links --}}
                            <div class="text-[14.5px] text-center mt-6">
                                <span class="text-white">
                                    Are you a Pro?
                                    <a href="/profession/create" class="text-white hover:underline font-bold">Register Now!</a>
                                </span>
                                <br>
                                <span class="text-white mt-2 block">
                                    Need a Service?
                                    <a href="/customer/createrequests/" class="text-white hover:underline font-bold">Get Started!</a>
                                </span>
                            </div>

                            </form>
                    </div>
                </div>
            </div>
        </div>
    </form>

</x-guest-layout>
