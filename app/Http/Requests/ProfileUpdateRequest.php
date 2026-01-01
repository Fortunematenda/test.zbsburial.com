<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'company_name' => ['nullable', 'string', 'max:255'],
            'company_registration_number' => ['nullable', 'string', 'max:50'],
            'profile_picture' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif', 'max:2048'], // Not always required
            'logo' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif', 'max:2048'], // Not always required
            'biography' => ['nullable', 'string'],
            'location' => ['required', 'string', 'max:255'],
            'latitude' => 'nullable|numeric', // Latitude
            'longitude' => 'nullable|numeric', // Longitude
            'distance' => 'nullable|in:10,20,50',
            'is_company_website' => ['boolean'],
            'company_size' => ['nullable', 'in:Self-employed,Sole Trader,2-10,11-50,51-200,200+'],
            'is_company_sales_team' => ['boolean'],
            'contact_number' => ['required', 'regex:/^0[6-8][0-9]{8}$/'],
            'email' => ['required','string','email','max:255',
                Rule::unique(User::class)->ignore($this->user()->id),
            ],
        ];
    }

    public function messages(): array
{
    return [
        'first_name.required' => 'The first name is required.',
        'last_name.required' => 'The last name is required.',
        'location.required' => 'Please provide your location.',
        'email.required' => 'The email address is required.',
        'email.email' => 'Please provide a valid email address.',
        'email.unique' => 'This email is already registered.',
        'profile_picture.image' => 'The profile picture must be an image.',
        'profile_picture.mimes' => 'The profile picture must be a file of type: jpeg, png, jpg, gif.',
        'profile_picture.max' => 'The profile picture must not exceed 2 MB.',
        'distance.in' => 'The distance must be one of the following: 10, 20, 50.',
    ];
}
}
