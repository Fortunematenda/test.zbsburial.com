<?php

namespace App\Services;

use Kreait\Firebase\Factory;
use Kreait\Firebase\Messaging\CloudMessage;

class FirebasePushNotification
{
    /**
     * Send a data-only push notification.
     *
     * @param string $title
     * @param string $body
     * @param string|array $deviceToken
     * @param string $url
     * @return mixed
     */
    public static function sendNotification(string $title, string $body, $deviceToken, string $url)
    {
        $credentials = env('FIREBASE_CREDENTIALS', base_path('app/firebase/firebase-service-account.json'));
        $factory = (new Factory)->withServiceAccount($credentials);
        $messaging = $factory->createMessaging();

        // Data payload
        $data = [
            'title' => $title,
            'body' => $body,
            'click_action' => 'FLUTTER_NOTIFICATION_CLICK',
            'url' => $url,
        ];

        if (is_array($deviceToken)) {
            $baseMessage = CloudMessage::new()->withData($data);
            return $messaging->sendMulticast($baseMessage, $deviceToken);
        }

        $message = CloudMessage::withTarget('token', $deviceToken)
            ->withData($data);

        return $messaging->send($message);
    }
}
