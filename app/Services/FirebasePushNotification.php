<?php

namespace App\Services;

use Kreait\Firebase\Factory;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Firebase\Messaging\Notification;
use Kreait\Firebase\Messaging\MulticastSendReport;

class FirebasePushNotification
{
    /**
     * Send a notification to one or multiple device tokens.
     *
     * @param string $title
     * @param string $body
     * @param string|array $deviceToken
     * @return mixed
     */
    public static function sendNotification(string $title, string $body, $deviceToken,$url="#")
    {
        $credentials = env('FIREBASE_CREDENTIALS', base_path('app/firebase/firebase-service-account.json'));
        $factory = (new Factory)->withServiceAccount($credentials);
        $messaging = $factory->createMessaging();

        // Create the notification
        $notification = Notification::create($title, $body);

        // Handle multiple tokens
        if (is_array($deviceToken)) {
            $baseMessage = CloudMessage::new()->withNotification($notification)->withData([
              'click_action' => 'FLUTTER_NOTIFICATION_CLICK',
        'url' => $url,
    ]);
            return $messaging->sendMulticast($baseMessage, $deviceToken);
        }

        // Handle single token
        $message = CloudMessage::withTarget('token', $deviceToken)
            ->withNotification($notification)->withData([
              'click_action' => 'FLUTTER_NOTIFICATION_CLICK',
        'url' => $url,
    ]);

        return $messaging->send($message);
    }
}
