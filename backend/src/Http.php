<?php
// Fimrash Logistics Services - HTTP helpers: JSON I/O, CORS, errors, input validation

namespace Fimrash;

class HttpException extends \Exception {
    public array $extra;

    public function __construct(int $status, string $message, array $extra = []) {
        parent::__construct($message, $status);
        $this->extra = $extra;
    }
}

class Http {
    public static function sendCors(): void {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        $allowed = Config::get('allowed_origins', ['*']);
        if (!is_array($allowed)) {
            $allowed = array_map('trim', explode(',', (string) $allowed));
        }
        // The Fimrash Android app (Capacitor) always calls from these origins.
        $allowed = array_merge($allowed, ['https://localhost', 'capacitor://localhost']);

        if (in_array('*', $allowed, true)) {
            header('Access-Control-Allow-Origin: *');
        } elseif ($origin !== '' && self::originAllowed($origin, $allowed)) {
            header('Access-Control-Allow-Origin: ' . $origin);
            header('Vary: Origin');
        }
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        header('Access-Control-Max-Age: 86400');
    }

    // Supports exact origins and a single leading wildcard label, e.g. https://*.vercel.app
    private static function originAllowed(string $origin, array $allowed): bool {
        foreach ($allowed as $pattern) {
            if ($pattern === $origin) {
                return true;
            }
            if (str_contains($pattern, '*.')) {
                $regex = '#^' . str_replace('\*', '[a-z0-9-]+', preg_quote($pattern, '#')) . '$#i';
                if (preg_match($regex, $origin)) {
                    return true;
                }
            }
        }
        return false;
    }

    public static function json(array $data, int $status = 200): void {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        header('X-Content-Type-Options: nosniff');
        header('Cache-Control: no-store');
        echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        exit;
    }

    public static function input(): array {
        $raw = file_get_contents('php://input');
        if ($raw === '' || $raw === false) {
            return [];
        }
        $data = json_decode($raw, true);
        if (!is_array($data)) {
            throw new HttpException(400, 'Request body must be valid JSON');
        }
        return $data;
    }

    public static function clientIp(): string {
        return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    }

    public static function bearerToken(): ?string {
        $header = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
        if ($header === '' && function_exists('getallheaders')) {
            foreach (getallheaders() as $name => $value) {
                if (strcasecmp($name, 'Authorization') === 0) {
                    $header = $value;
                    break;
                }
            }
        }
        if (!str_starts_with($header, 'Bearer ')) {
            return null;
        }
        return trim(substr($header, 7));
    }

    // ── Validation helpers ──────────────────────────────────────

    public static function text(array $input, string $key, int $maxLen, bool $required = true, string $label = ''): string {
        $value = trim(strip_tags((string) ($input[$key] ?? '')));
        $value = preg_replace('/\s+/u', ' ', $value);
        $label = $label ?: $key;
        if ($required && $value === '') {
            throw new HttpException(422, "{$label} is required", ['field' => $key]);
        }
        if (mb_strlen($value) > $maxLen) {
            throw new HttpException(422, "{$label} must be at most {$maxLen} characters", ['field' => $key]);
        }
        return $value;
    }

    // Normalises Nigerian mobile numbers to the local 11-digit form, e.g. 08031234567.
    public static function phone(array $input, string $key, string $label = 'Phone number'): string {
        $normalised = self::normalisePhone((string) ($input[$key] ?? ''));
        if ($normalised === null) {
            throw new HttpException(422, "{$label} must be a valid Nigerian mobile number (e.g. 08031234567)", ['field' => $key]);
        }
        return $normalised;
    }

    public static function normalisePhone(string $raw): ?string {
        $digits = preg_replace('/\D/', '', $raw);
        if (str_starts_with($digits, '234') && strlen($digits) === 13) {
            $digits = '0' . substr($digits, 3);
        } elseif (strlen($digits) === 10 && in_array($digits[0], ['7', '8', '9'], true)) {
            $digits = '0' . $digits;
        }
        if (!preg_match('/^0[789][01]\d{8}$/', $digits)) {
            return null;
        }
        return $digits;
    }

    public static function money(array $input, string $key, float $max): float {
        $raw = $input[$key] ?? 0;
        if ($raw === '' || $raw === null) {
            return 0.0;
        }
        if (!is_numeric($raw)) {
            throw new HttpException(422, "{$key} must be a number", ['field' => $key]);
        }
        $value = round((float) $raw, 2);
        if ($value < 0 || $value > $max) {
            throw new HttpException(422, "{$key} must be between 0 and " . number_format($max), ['field' => $key]);
        }
        return $value;
    }

    public static function oneOf(array $input, string $key, array $allowed, ?string $default = null): string {
        $value = $input[$key] ?? $default;
        if (!in_array($value, $allowed, true)) {
            throw new HttpException(422, "{$key} must be one of: " . implode(', ', $allowed), ['field' => $key]);
        }
        return $value;
    }
}
