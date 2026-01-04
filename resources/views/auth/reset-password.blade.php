<x-guest-layout>
<x-auth-session-status class="mb-4" :status="session('status')" />
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width">
    <title>Reset Password - Fortai</title>
    <link rel="stylesheet" href="{{asset('build/assets/css/5a8bc88891d37fb6.css')}}">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
    <style>
        #password-toggle, #password-confirmation-toggle {
            transition: opacity 0.3s;
        }
        #password-toggle:hover, #password-confirmation-toggle:hover {
            opacity: 1;
            color: rgba(255, 255, 255, 1) !important;
        }
        #password-toggle svg, #password-confirmation-toggle svg {
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
                   
                    <form method="POST" action="{{ route('password.store') }}">
                        @csrf

                        <!-- Password Reset Token -->
                        <input type="hidden" name="token" value="{{ $request->route('token') }}">

                        <h1 class="text-center" style="font-size: 25px;">Reset Password</h1>

                        <div class="relative mt-6 flex justify-center items-center">
                            <div class="bg-white h-[1px] w-[18%] md:w-[25%]"></div>
                            <div class="relative text-sm leading-5 px-2 text-white font-medium">
                                create new password
                            </div>
                            <div class="bg-white h-[1px] w-[18%] md:w-[25%]"></div>
                        </div>

                        <p class="text-center text-sm mt-4 leading-relaxed" style="color: #FFFFFF !important;">
                            Enter your new password below. Make sure it's at least 8 characters long.
                        </p>

                        <!-- Email Address (Hidden but required) -->
                        <input type="hidden" name="email" value="{{ old('email', $request->email) }}">

                        <!-- Password -->
                        <div class="w-full h-[50px] [margin:30px_0]" style="position: relative;">
                            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                                <i class="fas fa-lock text-white/50"></i>
                            </div>
                            <input 
                                id="password" 
                                name="password" 
                                type="password" 
                                required 
                                autocomplete="new-password"
                                placeholder="New Password (min. 8 characters)"
                                class="h-full w-full bg-transparent outline-none border-2 border-solid 
                                border-[rgba(255,255,255,.2)] [border-radius:40px] text-[16px] text-white 
                                [padding:20px_50px_20px_45px] placeholder:text-white"
                            />
                            <button 
                                type="button" 
                                id="password-toggle" 
                                style="position: absolute !important; right: 20px !important; top: 50% !important; transform: translateY(-50%) !important; cursor: pointer !important; background: transparent !important; border: none !important; outline: none !important; padding: 0 !important; z-index: 100 !important; color: rgba(255, 255, 255, 0.8) !important; width: 20px !important; height: 20px !important; display: flex !important; align-items: center !important; justify-content: center !important;" 
                                aria-label="Toggle password visibility"
                            >
                                <svg id="password-eye-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.9)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: block !important; width: 18px !important; height: 18px !important;">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                                <svg id="password-eye-off-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.9)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: none !important; width: 18px !important; height: 18px !important;">
                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                    <line x1="1" y1="1" x2="23" y2="23"></line>
                                </svg>
                            </button>
                            @error('password')
                                <p class="mt-2 text-sm" style="color: #8B5CF6;">{{ $message }}</p>
                            @enderror
                        </div>

                        <!-- Confirm Password -->
                        <div class="w-full h-[50px] [margin:30px_0]" style="position: relative;">
                            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                                <i class="fas fa-lock text-white/50"></i>
                            </div>
                            <input 
                                id="password_confirmation" 
                                name="password_confirmation" 
                                type="password" 
                                required 
                                autocomplete="new-password"
                                placeholder="Confirm New Password"
                                class="h-full w-full bg-transparent outline-none border-2 border-solid 
                                border-[rgba(255,255,255,.2)] [border-radius:40px] text-[16px] text-white 
                                [padding:20px_50px_20px_45px] placeholder:text-white"
                            />
                            <button 
                                type="button" 
                                id="password-confirmation-toggle" 
                                style="position: absolute !important; right: 20px !important; top: 50% !important; transform: translateY(-50%) !important; cursor: pointer !important; background: transparent !important; border: none !important; outline: none !important; padding: 0 !important; z-index: 100 !important; color: rgba(255, 255, 255, 0.8) !important; width: 20px !important; height: 20px !important; display: flex !important; align-items: center !important; justify-content: center !important;" 
                                aria-label="Toggle password visibility"
                            >
                                <svg id="confirm-eye-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.9)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: block !important; width: 18px !important; height: 18px !important;">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                                <svg id="confirm-eye-off-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.9)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: none !important; width: 18px !important; height: 18px !important;">
                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                    <line x1="1" y1="1" x2="23" y2="23"></line>
                                </svg>
                            </button>
                            @error('password_confirmation')
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
                            Reset Password
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

    <script>
        // Password visibility toggle for password field
        document.addEventListener('DOMContentLoaded', function() {
            const passwordInput = document.getElementById('password');
            const passwordToggle = document.getElementById('password-toggle');
            const passwordEyeIcon = document.getElementById('password-eye-icon');
            const passwordEyeOffIcon = document.getElementById('password-eye-off-icon');
            
            if (passwordToggle && passwordInput && passwordEyeIcon && passwordEyeOffIcon) {
                passwordToggle.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    togglePasswordVisibility(passwordInput, passwordEyeIcon, passwordEyeOffIcon);
                });
            }

            // Password visibility toggle for confirmation field
            const confirmInput = document.getElementById('password_confirmation');
            const confirmToggle = document.getElementById('password-confirmation-toggle');
            const confirmEyeIcon = document.getElementById('confirm-eye-icon');
            const confirmEyeOffIcon = document.getElementById('confirm-eye-off-icon');
            
            if (confirmToggle && confirmInput && confirmEyeIcon && confirmEyeOffIcon) {
                confirmToggle.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    togglePasswordVisibility(confirmInput, confirmEyeIcon, confirmEyeOffIcon);
                });
            }
            
            function togglePasswordVisibility(input, eyeIcon, eyeOffIcon) {
                const isPassword = input.type === 'password';
                input.type = isPassword ? 'text' : 'password';
                
                if (isPassword) {
                    // Show password - switch to eye-slash
                    eyeIcon.style.display = 'none';
                    eyeOffIcon.style.display = 'block';
                } else {
                    // Hide password - switch to eye
                    eyeIcon.style.display = 'block';
                    eyeOffIcon.style.display = 'none';
                }
            }
        });
    </script>

</x-guest-layout>
