<?php

namespace App\Helpers;

class ContactHelper
{
    /**
     * Mask contact information for privacy
     * 
     * @param string $value
     * @param string $type 'phone' or 'email'
     * @return string
     */
    public static function maskContactInfo(string $value, string $type = 'phone'): string
    {
        if (empty($value)) {
            return $value;
        }

        if ($type === 'phone') {
            if (strlen($value) >= 3) {
                $masked = substr($value, 0, 3) . str_repeat('*', strlen($value) - 5) . substr($value, -2);
                return $masked;
            }
            return str_repeat('*', strlen($value));
        }

        if ($type === 'email') {
            if (strpos($value, '@') !== false) {
                [$local, $domain] = explode('@', $value, 2);
                $maskedLocal = substr($local, 0, 2) . str_repeat('*', max(0, strlen($local) - 2));
                return $maskedLocal . '@' . $domain;
            }
            return str_repeat('*', strlen($value));
        }

        return $value;
    }
}

