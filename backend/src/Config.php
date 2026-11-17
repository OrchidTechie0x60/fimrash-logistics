<?php
// Fimrash Logistics Services - Configuration loader
// Reads backend/config.php, falling back to environment variables.

namespace Fimrash;

class Config {
    private static ?array $config = null;

    private static function load(): array {
        if (self::$config === null) {
            $file = __DIR__ . '/../config.php';
            // FIMRASH_CONFIG lets the test suite point at an isolated config.
            $override = getenv('FIMRASH_CONFIG');
            if ($override) {
                $file = $override;
            }
            self::$config = file_exists($file) ? (require $file) : [];
        }
        return self::$config;
    }

    public static function get(string $key, $default = null) {
        $config = self::load();
        if (array_key_exists($key, $config)) {
            return $config[$key];
        }
        $env = getenv('FIMRASH_' . strtoupper($key));
        return $env !== false ? $env : $default;
    }

    public static function storageDir(): string {
        $dir = getenv('FIMRASH_STORAGE') ?: __DIR__ . '/../storage';
        if (!is_dir($dir)) {
            mkdir($dir, 0750, true);
        }
        return $dir;
    }

    public static function isDebug(): bool {
        return (bool) self::get('debug', false);
    }

    // The signing secret is required in production. For local SQLite development a random
    // secret is generated once and kept in storage/ so tokens survive restarts.
    public static function appSecret(): string {
        $secret = (string) self::get('app_secret', '');
        if ($secret !== '' && $secret !== 'REPLACE_WITH_64_HEX_CHARS') {
            if (strlen($secret) < 32) {
                throw new \RuntimeException('app_secret in config.php must be at least 32 characters');
            }
            return $secret;
        }
        if (self::get('driver', 'sqlite') !== 'sqlite') {
            throw new \RuntimeException('app_secret is not set in config.php');
        }
        $keyFile = self::storageDir() . '/app_secret.key';
        if (!file_exists($keyFile)) {
            file_put_contents($keyFile, bin2hex(random_bytes(32)));
            chmod($keyFile, 0600);
        }
        return trim(file_get_contents($keyFile));
    }
}
