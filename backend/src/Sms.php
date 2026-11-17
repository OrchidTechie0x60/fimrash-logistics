<?php
// Fimrash Logistics Services - Optional transactional SMS (Termii).
// Failures are logged, never fatal: the booking still succeeds and the sender can share via WhatsApp.

namespace Fimrash;

class Sms {
    public static function isEnabled(): bool {
        $sms = Config::get('sms', []);
        return is_array($sms) && !empty($sms['api_key']) && function_exists('curl_init');
    }

    public static function send(string $localPhone, string $message): bool {
        if (!self::isEnabled()) {
            return false;
        }
        $sms = Config::get('sms');
        $to = '234' . substr($localPhone, 1); // 0803... -> 234803...

        $ch = curl_init('https://api.ng.termii.com/api/sms/send');
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 8,
            CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
            CURLOPT_POSTFIELDS     => json_encode([
                'to'      => $to,
                'from'    => $sms['sender_id'] ?? 'Fimrash',
                'sms'     => $message,
                'type'    => 'plain',
                'channel' => $sms['channel'] ?? 'generic',
                'api_key' => $sms['api_key'],
            ]),
        ]);
        $body = curl_exec($ch);
        $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($body === false || $status >= 300) {
            error_log("[Fimrash SMS] send to {$to} failed (HTTP {$status}): " . ($error ?: substr((string) $body, 0, 300)));
            return false;
        }
        return true;
    }
}
