<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class UpdateUserProfileRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization handled by auth:sanctum middleware
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'first_name'             => ['nullable', 'string', 'max:255'],
            'last_name'              => ['nullable', 'string', 'max:255'],
            'email'                  => ['nullable', 'email', 'max:255', 'unique:users,email,' . $this->user()->id],
            'contact_number'         => ['nullable', 'string', 'max:20'],
            'location'               => ['nullable', 'string', 'max:255'],
            'zip_code'               => ['nullable', 'string', 'max:20'],
            'latitude'               => ['nullable', 'numeric', 'between:-90,90'],
            'longitude'              => ['nullable', 'numeric', 'between:-180,180'],
            'distance'               => ['nullable', 'numeric', 'min:0'],
            'company_name'           => ['nullable', 'string', 'max:255'],
            'is_company_website'     => ['nullable', 'boolean'],
            'company_size'           => ['nullable', 'string', 'max:50'],
            'is_company_sales_team'  => ['nullable', 'boolean'],
            'is_company_social_media' => ['nullable', 'boolean'],
            'biography'              => ['nullable', 'string', 'max:2000'],
            'profile_picture'        => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif', 'max:5120'], // 5MB max
        ];
    }

    /**
     * Get custom error messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'email.email'            => 'Please provide a valid email address.',
            'email.unique'           => 'This email is already taken.',
            'first_name.max'         => 'First name cannot exceed 255 characters.',
            'last_name.max'          => 'Last name cannot exceed 255 characters.',
            'contact_number.max'     => 'Contact number cannot exceed 20 characters.',
            'location.max'           => 'Location cannot exceed 255 characters.',
            'latitude.numeric'       => 'Latitude must be a number.',
            'latitude.between'       => 'Latitude must be between -90 and 90.',
            'longitude.numeric'      => 'Longitude must be a number.',
            'longitude.between'      => 'Longitude must be between -180 and 180.',
            'distance.numeric'       => 'Distance must be a number.',
            'distance.min'           => 'Distance cannot be negative.',
            'profile_picture.image'  => 'Profile picture must be an image.',
            'profile_picture.mimes'   => 'Profile picture must be a JPEG, PNG, JPG, or GIF.',
            'profile_picture.max'     => 'Profile picture cannot exceed 5MB.',
            'biography.max'           => 'Biography cannot exceed 2000 characters.',
        ];
    }

    /**
     * Handle a failed validation attempt.
     */
    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors'  => $validator->errors()
            ], 422)
        );
    }
}

