<x-guest-layout>
    <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
        <div class="max-w-lg w-full bg-white p-8 rounded-xl shadow-lg">
            <h2 class="text-2xl font-semibold text-gray-800 mb-6">
                {{ __('Reset Your Password') }}
            </h2>

            <p class="mb-6 text-gray-600">
                {{ __('Forgot your password? No problem. Just enter your email address and we will send you a password reset link.') }}
            </p>

            <!-- Session Status -->
            <x-auth-session-status class="mb-4" :status="session('status')" />

            <form method="POST" action="{{ route('password.email') }}">
    @csrf

    <!-- Email Address -->
    <div class="mb-5">
        <x-input-label for="email" :value="__('Email Address')" />
        <x-text-input
    id="email"
    class="mt-1 block w-full text-black"
    type="email"
    name="email"
    :value="old('email')"
    required
    autofocus
    autocomplete="email"
/>

        <x-input-error :messages="$errors->get('email')" class="mt-2" />
    </div>

    <!-- Submit Button centered -->
    <div class="flex justify-center mt-6">
        <x-primary-button>
            {{ __('Send Password Reset Link') }}
        </x-primary-button>
    </div>
</form>

        </div>
    </div>
</x-guest-layout>
