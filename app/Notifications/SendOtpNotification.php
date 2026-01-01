<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\NexmoMessage;
use Illuminate\Support\Facades\Log;

class SendOtpNotification extends Notification
{
    use Queueable;

    private $otp;

    // Constructor to accept OTP
    public function __construct($otp)
    {
        $this->otp = $otp;
    }

    // The method to send OTP via mail (you can also send via SMS or other channels)
    public function via($notifiable)
    {
        // You can return a channel array such as ['mail', 'database', 'nexmo'] based on your requirements
        return ['mail']; // For email notification only
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
                    ->line('Your OTP is: ' . $this->otp)
                    ->line('Please use this OTP to complete your verification.')
                   // ->action('Verify', url('/verify-otp')) // Optional: Add a verification link
                    ->line('Thank you for using our application!');
    }

    // You can implement additional methods to send OTP via SMS or other channels
}
