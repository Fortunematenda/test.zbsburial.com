<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class CreateLeadRequest extends FormRequest
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
            'description'    => ['required', 'string', 'max:1000'],
            'category'       => ['required', 'string', 'max:100'],
            'budget'         => ['required', 'string', 'max:100'],
            'location'       => ['required', 'string', 'max:255'],
            'urgency'        => ['required', 'string', 'in:Low,Normal,High,Urgent'],
            'images'         => ['nullable', 'array'],
            'images.*'       => ['nullable', 'string'],
            'questionAnswers' => ['nullable', 'array'],
            'latitude'       => ['nullable', 'numeric', 'between:-90,90'],
            'longitude'      => ['nullable', 'numeric', 'between:-180,180'],
            'zip_code'       => ['nullable', 'string', 'max:20'],
        ];
    }

    /**
     * Get custom error messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'description.required' => 'Description is required.',
            'description.max'      => 'Description cannot exceed 1000 characters.',
            'category.required'    => 'Category is required.',
            'category.max'         => 'Category cannot exceed 100 characters.',
            'budget.required'      => 'Budget is required.',
            'budget.max'           => 'Budget cannot exceed 100 characters.',
            'location.required'    => 'Location is required.',
            'location.max'         => 'Location cannot exceed 255 characters.',
            'urgency.required'     => 'Urgency level is required.',
            'urgency.in'           => 'Urgency must be one of: Low, Normal, High, Urgent.',
            'images.array'         => 'Images must be an array.',
            'latitude.numeric'     => 'Latitude must be a number.',
            'latitude.between'     => 'Latitude must be between -90 and 90.',
            'longitude.numeric'    => 'Longitude must be a number.',
            'longitude.between'   => 'Longitude must be between -180 and 180.',
        ];
    }

    /**
     * Handle a failed validation attempt.
     */
    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            response()->json([
                'status'  => 'error',
                'message' => 'Validation failed',
                'errors'  => $validator->errors()
            ], 422)
        );
    }
}

