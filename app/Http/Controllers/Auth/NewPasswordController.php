<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Illuminate\View\View;

class NewPasswordController extends Controller
{
    /**
     * Display the password reset view.
     */
    public function create(Request $request): View
    {
        return view('auth.reset-password', ['request' => $request]);
    }

    /**
     * Handle an incoming new password request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse|JsonResponse
    {
        $request->validate([
            'token' => ['required'],
            'email' => ['required', 'email'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        // Here we will attempt to reset the user's password. If it is successful we
        // will update the password on an actual user model and persist it to the
        // database. Otherwise we will parse the error and return the response.
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user) use ($request) {
                $user->forceFill([
                    'password' => Hash::make($request->password),
                    'remember_token' => Str::random(60),
                ])->save();

                event(new PasswordReset($user));
            }
        );

        // Check if this is an API request (expects JSON)
        if ($request->expectsJson() || $request->is('api/*')) {
            if ($status == Password::PASSWORD_RESET) {
                return response()->json([
                    'status' => 'success',
                    'message' => 'Your password has been reset successfully.',
                ], 200);
            } else {
                $errorMessage = 'Unable to reset password.';
                
                if ($status == Password::INVALID_TOKEN) {
                    $errorMessage = 'This password reset token is invalid.';
                } elseif ($status == Password::INVALID_USER) {
                    $errorMessage = 'We can\'t find a user with that email address.';
                } elseif ($status == Password::THROTTLED) {
                    $errorMessage = 'Please wait before retrying.';
                }
                
                return response()->json([
                    'status' => 'error',
                    'message' => $errorMessage,
                ], 400);
            }
        }

        // Web request - return redirect
        return $status == Password::PASSWORD_RESET
                    ? redirect()->route('login')->with('status', __($status))
                    : back()->withInput($request->only('email'))
                            ->withErrors(['email' => __($status)]);
    }
}
