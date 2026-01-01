<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ExpoPushNotification
{
    /**
     * Expo Push Notification API endpoint
     */
    private const EXPO_API_URL = 'https://exp.host/--/api/v2/push/send';

    /**
     * Send push notification via Expo Push Notification Service
     *
     * @param string|array $expoPushTokens Expo Push Token(s) (format: ExponentPushToken[...])
     * @param string $title Notification title
     * @param string $body Notification body/message
     * @param array $data Additional data to send with notification
     * @param string|null $sound Sound to play (default: 'default')
     * @param int|null $badge Badge count
     * @return array|false Response from Expo API or false on failure
     */
    public static function sendNotification(
        $expoPushTokens,
        string $title,
        string $body,
        array $data = [],
        ?string $sound = 'default',
        ?int $badge = null
    ) {
        try {
            // Ensure tokens is an array
            $tokens = is_array($expoPushTokens) ? $expoPushTokens : [$expoPushTokens];
            
            // Filter out invalid tokens (must start with ExponentPushToken)
            $validTokens = array_filter($tokens, function($token) {
                return !empty($token) && (strpos($token, 'ExponentPushToken') === 0);
            });

            if (empty($validTokens)) {
                Log::warning('No valid Expo push tokens provided', ['tokens' => $tokens]);
                return false;
            }

            // Prepare notification payload
            $messages = [];
            foreach ($validTokens as $token) {
                $message = [
                    'to' => $token,
                    'sound' => $sound,
                    'title' => $title,
                    'body' => $body,
                    'data' => $data,
                ];

                if ($badge !== null) {
                    $message['badge'] = $badge;
                }

                $messages[] = $message;
            }

            // Send to Expo Push Notification API
            $response = Http::timeout(10)->post(self::EXPO_API_URL, $messages);

            if ($response->successful()) {
                $responseData = $response->json();
                
                // Log any errors from Expo
                if (isset($responseData['data'])) {
                    foreach ($responseData['data'] as $result) {
                        if (isset($result['status']) && $result['status'] === 'error') {
                            Log::warning('Expo push notification error', [
                                'error' => $result['message'] ?? 'Unknown error',
                                'token' => $result['details']['expoPushToken'] ?? 'unknown'
                            ]);
                        }
                    }
                }

                Log::info('Expo push notifications sent', [
                    'tokens_count' => count($validTokens),
                    'response' => $responseData
                ]);

                return $responseData;
            } else {
                Log::error('Failed to send Expo push notification', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
                return false;
            }
        } catch (\Exception $e) {
            Log::error('Exception sending Expo push notification', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return false;
        }
    }

    /**
     * Check if a token is an Expo Push Token
     *
     * @param string $token
     * @return bool
     */
    public static function isExpoToken(string $token): bool
    {
        return strpos($token, 'ExponentPushToken') === 0;
    }

    /**
     * Send notification to multiple tokens (handles both Expo and Firebase)
     * This is a helper method that routes to the appropriate service
     *
     * @param string|array $tokens Push token(s)
     * @param string $title
     * @param string $body
     * @param string $url Deep link URL
     * @return bool Success status
     */
    public static function sendNotificationToTokens($tokens, string $title, string $body, string $url = '')
    {
        $tokensArray = is_array($tokens) ? $tokens : [$tokens];
        
        // Separate Expo tokens from Firebase tokens
        $expoTokens = [];
        $firebaseTokens = [];
        
        foreach ($tokensArray as $token) {
            if (empty($token)) continue;
            
            if (self::isExpoToken($token)) {
                $expoTokens[] = $token;
            } else {
                // Assume Firebase token if not Expo
                $firebaseTokens[] = $token;
            }
        }

        $success = true;

        // Send Expo notifications
        if (!empty($expoTokens)) {
            $expoResult = self::sendNotification(
                $expoTokens,
                $title,
                $body,
                ['url' => $url],
                'default',
                null
            );
            if ($expoResult === false) {
                $success = false;
            }
        }

        // Send Firebase notifications (for web/desktop)
        if (!empty($firebaseTokens)) {
            try {
                \App\Services\FirebasePushNotification::sendNotification(
                    $title,
                    $body,
                    count($firebaseTokens) === 1 ? $firebaseTokens[0] : $firebaseTokens,
                    $url
                );
            } catch (\Exception $e) {
                Log::error('Firebase notification failed', ['error' => $e->getMessage()]);
                $success = false;
            }
        }

        return $success;
    }
}

