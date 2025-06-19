<x-guest-layout>
    <form method="POST" action="{{ route('password.store') }}">
        @csrf

        <!-- Password Reset Token -->
        <input type="hidden" name="token" value="{{ $request->route('token') }}">

        <!-- Email Address -->
        <div>
            <x-input-label for="email" :value="__('Email')" />
            <x-text-input id="email" class="block mt-1 w-full" type="email" name="email" :value="old('email', $request->email)" required autofocus autocomplete="username" style="color:black !important;"/>
            <x-input-error :messages="$errors->get('email')" class="mt-2" />
        </div>
<!-- Include FontAwesome for the eye icon -->
<script src="https://kit.fontawesome.com/a076d05399.js" crossorigin="anonymous"></script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">

<!-- Password -->
<div class="mt-4 relative">
    <x-input-label for="password" :value="__('Password')" />

    <div class="relative">
        <x-text-input id="password" class="block mt-1 w-full pr-10" type="password" name="password" required autocomplete="new-password" style="color:black !important; padding-right: 2.5rem;" />

        <!-- Eye Icon inside input -->
        <span class="absolute inset-y-0 right-3 flex items-center cursor-pointer" onclick="togglePassword('password', 'togglePasswordIcon')">
            <i id="togglePasswordIcon" class="fas fa-eye text-gray-500"></i>
        </span>
    </div>

    <x-input-error :messages="$errors->get('password')" class="mt-2" />
</div>

<!-- Confirm Password -->
<div class="mt-4 relative">
    <x-input-label for="password_confirmation" :value="__('Confirm Password')" />

    <div class="relative">
        <x-text-input id="password_confirmation" class="block mt-1 w-full pr-10" type="password" name="password_confirmation" required autocomplete="new-password" style="color:black !important; padding-right: 2.5rem;" />

        <!-- Eye Icon inside input -->
        <span class="absolute inset-y-0 right-3 flex items-center cursor-pointer" onclick="togglePassword('password_confirmation', 'toggleConfirmPasswordIcon')">
            <i id="toggleConfirmPasswordIcon" class="fas fa-eye text-gray-500"></i>
        </span>
    </div>

    <x-input-error :messages="$errors->get('password_confirmation')" class="mt-2" />
</div>

<!-- JavaScript for toggling password visibility -->
<script>
    function togglePassword(inputId, iconId) {
        let input = document.getElementById(inputId);
        let icon = document.getElementById(iconId);
        
        if (input.type === "password") {
            input.type = "text";
            icon.classList.remove("fa-eye");
            icon.classList.add("fa-eye-slash");
        } else {
            input.type = "password";
            icon.classList.remove("fa-eye-slash");
            icon.classList.add("fa-eye");
        }
    }
</script>


        <div class="flex items-center justify-end mt-4">
            <x-primary-button>
                {{ __('Reset Password') }}
            </x-primary-button>
        </div>
    </form>
</x-guest-layout>
