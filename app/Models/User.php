<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Models\Lead;
use App\Models\LeadsNotesModel;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'first_name',
        'last_name',
        'contact_number',
        'location',
        'zip_code',
        'role',
        'latitude',
        'longitude',
        'distance',
        'entered_by',
        'email',
        'credits_balance',
        'password',
        'is_company_website',
        'company_size',
        'is_company_social_media',
        'is_company_sales_team',
        'company_name',
        'biography',
        'company_registration_number',
        'profile_picture',
        'logo',
        'subscribed_services_notifications',
        'new_leads_notifications',
        'weekly_newsletter_notifications',
        'sms_notifications',
        'is_online',
        'last_seen',
        'is_active',
        'email_verified_at',
        'remember_token',
        'token',
        'fica_verified',
        'id_upload',
        'self_upload',
        'date_uploaded',
        'date_verified',
        'verified_by',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'credits_balance' => 'float',
        'is_online' => 'boolean',
        'last_seen' => 'datetime',
        'is_active' => 'boolean',
        'subscribed_services_notifications' => 'boolean',
        'new_leads_notifications' => 'boolean',
        'weekly_newsletter_notifications' => 'boolean',
        'sms_notifications' => 'boolean',
    ];

    public function getFullNameAttribute()
    {
        return "{$this->first_name} {$this->last_name}";
    }

    public function hasRole($role)
    {
        return $this->role === $role;
    }

    public function isOnline()
    {
        return $this->last_seen && $this->last_seen->gt(now()->subMinutes(2));
    }

    public function isActive()
    {
        return $this->is_active;
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOnline($query)
    {
        return $query->where('last_seen', '>=', now()->subMinutes(2));
    }

    // ✅ Corrected leadNotes relationship
    public function leadNotes()
    {
        return $this->hasMany(LeadsNotesModel::class, 'user_id');
    }

    // ✅ Accessor for last lead note description
    public function getLastLeadNoteDescriptionAttribute()
    {
        return $this->leadNotes()
            ->orderByDesc('date_entered')
            ->value('description');
    }

    /**
     * Get all leads created by this user
     */
    public function leads()
    {
        return $this->hasMany(LeadsModel::class, 'user_id');
    }

    /**
     * Get all services this user offers
     */
    public function services()
    {
        return $this->belongsToMany(
            ServicesModel::class,
            'user_services',
            'user_id',
            'service_id'
        )->withPivot('entered_by');
    }

    /**
     * Get all leads this user has contacted
     */
    public function contactedLeads()
    {
        return $this->hasMany(ContactedLeadsModel::class, 'user_id');
    }

    /**
     * Get all ratings given to this user
     */
    public function receivedRatings()
    {
        return $this->hasMany(RatingsModel::class, 'to_user_id');
    }

    /**
     * Get all ratings given by this user
     */
    public function givenRatings()
    {
        return $this->hasMany(RatingsModel::class, 'from_user_id');
    }

    /**
     * Get all leads where this user was hired
     */
    public function hiredLeads()
    {
        return $this->hasMany(LeadsModel::class, 'hired_expert_id');
    }

    /**
     * Get all portfolio items for this user
     */
    public function portfolio()
    {
        return $this->hasMany(PortfolioModel::class, 'user_id');
    }

}
