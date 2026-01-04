<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Password;
use Illuminate\View\View;

class PasswordResetLinkController extends Controller
{
    /**
     * Display the password reset link request view.
     */
    public function create(): View
    {
        return view('auth.forgot-password');
    }

    /**
     * Handle an incoming password reset link request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse|JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        // We will send the password reset link to this user. Once we have attempted
        // to send the link, we will examine the response then see the message we
        // need to show to the user. Finally, we'll send out a proper response.
        $status = Password::sendResetLink(
            $request->only('email')
        );

        // Check if this is an API request (expects JSON)
        if ($request->expectsJson() || $request->is('api/*')) {
            if ($status == Password::RESET_LINK_SENT) {
                return response()->json([
                    'status' => 'success',
                    'message' => 'Password reset link has been sent to your email address.',
                ], 200);
            } else {
                $errorMessage = 'Unable to send password reset email.';
                
                if ($status == Password::INVALID_USER) {
                    $errorMessage = 'We can\'t find a user with that email address.';
                } elseif ($status == Password::RESET_THROTTLED) {
                    $errorMessage = 'Please wait before retrying.';
                }
                
                return response()->json([
                    'status' => 'error',
                    'message' => $errorMessage,
                ], 400);
            }
        }

        // Web request - return redirect
        return $status == Password::RESET_LINK_SENT
                    ? back()->with('status', __($status))
                    : back()->withInput($request->only('email'))
                            ->withErrors(['email' => __($status)]);
    }
}
