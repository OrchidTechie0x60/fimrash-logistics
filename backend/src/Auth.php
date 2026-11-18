<?php
// Fimrash Logistics Services - Authentication: signed tokens, PIN/password hashing, role guards

namespace Fimrash;

use PDO;

class Auth {
    public const RIDER_TOKEN_TTL = 86400 * 3;  // riders stay signed in across a few shifts
    public const ADMIN_TOKEN_TTL = 3600 * 12;  // admins re-authenticate daily

    private static function b64url(string $data): string {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function b64urlDecode(string $data): string|false {
        return base64_decode(strtr($data, '-_', '+/'), true);
    }

    public static function issueToken(string $role, string $subject, int $ttl): string {
        $header = self::b64url(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
        $payload = self::b64url(json_encode([
            'sub'  => $subject,
            'role' => $role,
            'iat'  => time(),
            'exp'  => time() + $ttl,
        ]));
        $sig = self::b64url(hash_hmac('sha256', "$header.$payload", Config::appSecret(), true));
        return "$header.$payload.$sig";
    }

    public static function verifyToken(string $token): ?array {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return null;
        }
        [$header, $payload, $sig] = $parts;
        $expected = self::b64url(hash_hmac('sha256', "$header.$payload", Config::appSecret(), true));
        if (!hash_equals($expected, $sig)) {
            return null;
        }
        $json = self::b64urlDecode($payload);
        $claims = $json === false ? null : json_decode($json, true);
        if (!is_array($claims) || ($claims['exp'] ?? 0) < time() || empty($claims['sub']) || empty($claims['role'])) {
            return null;
        }
        return $claims;
    }

    // Resolves the bearer token to a live, active account (so deactivating a rider
    // revokes access immediately). Returns null for anonymous callers.
    public static function currentUser(PDO $db): ?array {
        static $resolved = false, $user = null;
        if ($resolved) {
            return $user;
        }
        $resolved = true;

        $token = Http::bearerToken();
        $claims = $token ? self::verifyToken($token) : null;
        if (!$claims) {
            return null;
        }

        if ($claims['role'] === 'rider') {
            $stmt = $db->prepare('SELECT id, name, phone, bike_number, active_zone, status FROM riders WHERE id = ? AND active = 1');
        } elseif ($claims['role'] === 'admin') {
            $stmt = $db->prepare('SELECT id, name, email FROM admin_users WHERE id = ? AND active = 1');
        } else {
            return null;
        }
        $stmt->execute([$claims['sub']]);
        $row = $stmt->fetch();
        if (!$row) {
            return null;
        }
        $row['role'] = $claims['role'];
        $user = $row;
        return $user;
    }

    public static function require(PDO $db, array $roles): array {
        $user = self::currentUser($db);
        if (!$user) {
            // Probing internal endpoints without a valid token is capped per IP.
            RateLimiter::hit($db, 'unauth-internal:' . Http::clientIp(), 60, 600);
            throw new HttpException(401, 'Please sign in to continue');
        }
        // Generous ceiling for real work; stops a leaked token from being used to scrape.
        RateLimiter::hit($db, 'internal-user:' . $user['role'] . ':' . $user['id'], 600, 600);
        if (!in_array($user['role'], $roles, true)) {
            throw new HttpException(403, 'You do not have access to this action');
        }
        return $user;
    }

    public static function hashSecret(string $secret): string {
        return password_hash($secret, PASSWORD_DEFAULT);
    }

    public static function validatePin(string $pin): void {
        if (!preg_match('/^\d{6,8}$/', $pin)) {
            throw new HttpException(422, 'PIN must be 6 to 8 digits', ['field' => 'pin']);
        }
        // Reject repeated digits, straight runs and the usual favourites.
        $ascending = '0123456789012345';
        $descending = '9876543210987654';
        if (count(array_unique(str_split($pin))) <= 2 || str_contains($ascending, $pin) || str_contains($descending, $pin)
            || in_array($pin, ['121212', '112233', '123123', '696969', '159753', '147258', '102030'], true)) {
            throw new HttpException(422, 'That PIN is too easy to guess. Choose another.', ['field' => 'pin']);
        }
    }

    public static function validatePassword(string $password): void {
        if (strlen($password) < 10) {
            throw new HttpException(422, 'Password must be at least 10 characters', ['field' => 'password']);
        }
    }

    public static function publicUser(array $user): array {
        if ($user['role'] === 'rider') {
            return [
                'role'       => 'rider',
                'id'         => $user['id'],
                'name'       => $user['name'],
                'phone'      => $user['phone'],
                'bikeNumber' => $user['bike_number'],
                'zone'       => $user['active_zone'],
                'status'     => $user['status'],
            ];
        }
        return [
            'role'  => 'admin',
            'id'    => $user['id'],
            'name'  => $user['name'],
            'email' => $user['email'],
        ];
    }
}
