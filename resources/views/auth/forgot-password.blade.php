<x-guest-layout>
<x-auth-session-status class="mb-4" :status="session('status')" />
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width">
    <title>Forgot Password - Fortai</title>
    <link rel="stylesheet" href="{{asset('build/assets/css/5a8bc88891d37fb6.css')}}">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
    <style>
        /* Password field with eye icon styles */
        #password-toggle {
            transition: opacity 0.3s;
        }
        #password-toggle:hover {
            opacity: 1;
            color: rgba(255, 255, 255, 1) !important;
        }
        #password-toggle svg {
            pointer-events: none;
        }
        /* Hide logo and hamburger menu */
        .bg-black > .px-4 {
            display: none !important;
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
                   
                    <form method="POST" action="{{ route('password.email') }}">
                        @csrf

                        <h1 class="text-center" style="font-size: 25px;">Forgot Password</h1>

                        <div class="relative mt-6 flex justify-center items-center">
                            <div class="bg-white h-[1px] w-[18%] md:w-[25%]"></div>
                            <div class="relative text-sm leading-5 px-2 text-white font-medium">
                                reset your password
                            </div>
                            <div class="bg-white h-[1px] w-[18%] md:w-[25%]"></div>
                        </div>

                        <p class="text-center text-sm mt-4 leading-relaxed" style="color: #FFFFFF !important;">
                            Enter your email address and we'll send you instructions to reset your password.
                        </p>

                        <!-- Email Address -->
                        <div class="w-full h-[50px] [margin:30px_0]">
                            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10" style="position: absolute;">
                                <i class="fas fa-envelope text-white/50"></i>
                            </div>
                            <input 
                                id="email" 
                                type="email" 
                                name="email" 
                                :value="old('email')" 
                                required 
                                autofocus 
                                autocomplete="email"
                                placeholder="Email"
                                class="h-full w-full bg-transparent outline-none border-2 border-solid 
                                border-[rgba(255,255,255,.2)] [border-radius:40px] text-[16px] text-white 
                                [padding:20px_45px_20px_45px] placeholder:text-white"
                            />
                            @error('email')
                                <p class="mt-2 text-sm" style="color: #8B5CF6;">{{ $message }}</p>
                            @enderror
                        </div>

                        <!-- General Errors -->
                        @if ($errors->any())
                            <div class="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
                                <ul class="list-disc list-inside text-sm text-red-200 space-y-1">
                                    @foreach ($errors->all() as $error)
                                        <li>{{ $error }}</li>
                                    @endforeach
                                </ul>
                            </div>
                        @endif

                        <!-- Submit Button -->
                        <button 
                            type="submit" 
                            class="w-full h-[45px] bg-white border-none outline-none rounded-full shadow-[0_0_10px_rgba(0,0,0,.1)] 
                            cursor-pointer text-base text-[#333] [font-weight:600] flex items-center justify-center"
                        >
                            Send Password Reset Link
                        </button>

                        <!-- Back to Login -->
                        <div class="text-center mt-4">
                            <a 
                                href="{{ route('login') }}" 
                                class="text-white/80 hover:text-white text-[14.5px] transition-colors inline-flex items-center"
                            >
                                <i class="fas fa-arrow-left mr-2"></i>
                                Back to Login
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</body>
</x-guest-layout>
