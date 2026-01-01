<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;

class LeadUnlockedNotification extends Notification
{
    use Queueable;

    protected $lead;
    protected $expert;

    public function __construct($lead, $expert)
    {
        $this->lead = $lead;
        $this->expert = $expert;
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toDatabase($notifiable)
    {
        return [
            'title' => 'Contact Info Unlocked',
            'body' => $this->expert->first_name . ' ' . $this->expert->last_name . ' has unlocked your contact information',
            'url' => 'fortai://lead/' . $this->lead->id,
            'type' => 'lead_unlocked',
            'lead_id' => $this->lead->id,
            'expert_id' => $this->expert->id,
        ];
    }
}

