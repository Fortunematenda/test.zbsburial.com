<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;

class LeadResponseNotification extends Notification
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
            'title' => 'New Response to Your Lead',
            'body' => $this->expert->first_name . ' ' . $this->expert->last_name . ' has responded to your lead',
            'url' => 'fortai://lead/' . $this->lead->id,
            'type' => 'lead_response',
            'lead_id' => $this->lead->id,
            'expert_id' => $this->expert->id,
        ];
    }
}

