<?php
// Fimrash Logistics Services - Database Handler
// Optimized for Whogohost (cPanel MySQL) & Local Development (SQLite)

namespace Fimrash;

use PDO;
use PDOException;

class Database {
    private static ?PDO $instance = null;

    public static function getConnection(): PDO {
        if (self::$instance === null) {
            // 1. Check for Whogohost / cPanel config file
            $configFile = __DIR__ . '/../config.php';
            $config = file_exists($configFile) ? require($configFile) : [];

            // 2. Read configuration parameters with fallbacks
            $driver   = $config['driver']   ?? getenv('DB_CONNECTION') ?: 'sqlite';
            $host     = $config['host']     ?? getenv('DB_HOST')       ?: '127.0.0.1';
            $port     = $config['port']     ?? getenv('DB_PORT')       ?: '3306';
            $database = $config['database'] ?? getenv('DB_DATABASE')   ?: 'fimrash_logistics';
            $username = $config['username'] ?? getenv('DB_USERNAME')   ?: 'root';
            $password = $config['password'] ?? getenv('DB_PASSWORD')   ?: '';

            try {
                if ($driver === 'mysql') {
                    $dsn = "mysql:host={$host};port={$port};dbname={$database};charset=utf8mb4";
                    self::$instance = new PDO($dsn, $username, $password, [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                        PDO::ATTR_EMULATE_PREPARES => false,
                        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
                    ]);
                } else {
                    // SQLite storage for zero-config local testing
                    $dbPath = __DIR__ . '/../storage/fimrash.sqlite';
                    $dbDir = dirname($dbPath);
                    if (!is_dir($dbDir)) {
                        mkdir($dbDir, 0777, true);
                    }

                    $isNew = !file_exists($dbPath);
                    self::$instance = new PDO("sqlite:{$dbPath}", null, null, [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    ]);

                    if ($isNew) {
                        self::initializeSchema(self::$instance);
                    }
                }
            } catch (PDOException $e) {
                http_response_code(500);
                header('Content-Type: application/json; charset=utf-8');
                echo json_encode([
                    'error' => 'Database connection failed on Whogohost server',
                    'message' => $e->getMessage(),
                    'driver' => $driver
                ]);
                exit;
            }
        }

        return self::$instance;
    }

    private static function initializeSchema(PDO $db): void {
        $schemaFile = __DIR__ . '/../schema.sql';
        if (file_exists($schemaFile)) {
            $sql = file_get_contents($schemaFile);
            $db->exec($sql);
        }
    }
}
