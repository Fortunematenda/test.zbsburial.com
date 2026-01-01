<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Carbon\Carbon;

class PasswordController extends Controller
{
    /**
     * Update the user's password (requires current password).
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validateWithBag('updatePassword', [
            'current_password' => ['required', 'current_password'],
            'password' => ['required', Password::defaults(), 'confirmed'],
        ]);

        $request->user()->update([
            'password' => Hash::make($validated['password']),
            'password_updated' => Carbon::now(), // Optional: if you want to track this
        ]);

        return back()->with('status', 'password-updated');
    }

    /**
     * Show form to change password without old password.
     */
    public function showChangePasswordForm()
    {
        return view('auth.change-password');
    }

    /**
     * Update the user's password without asking for old password.
     */
    public function updateWithoutOld(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = $request->user();
        $user->password = Hash::make($request->password);
        $user->password_updated = Carbon::now(); // Ensure this field exists in DB
        $user->save();

        // Use a consistent session key for display in Blade
        return back()->with('status', 'password-updated');
    }
}
