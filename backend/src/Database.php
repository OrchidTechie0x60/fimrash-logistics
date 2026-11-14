<?php
// Fimrash Logistics Services - Database Handler
// Supports SQLite (default zero-config local) & MySQL (Production)

namespace Fimrash;

use PDO;
use PDOException;

class Database {
    private static ?PDO $instance = null;

    public static function getConnection(): PDO {
        if (self::$instance === null) {
            $dbDriver = getenv('DB_CONNECTION') ?: 'sqlite';
            
            try {
                if ($dbDriver === 'mysql') {
                    $host = getenv('DB_HOST') ?: '127.0.0.1';
                    $port = getenv('DB_PORT') ?: '3306';
                    $database = getenv('DB_DATABASE') ?: 'fimrash_logistics';
                    $username = getenv('DB_USERNAME') ?: 'root';
                    $password = getenv('DB_PASSWORD') ?: '';

                    $dsn = "mysql:host={$host};port={$port};dbname={$database};charset=utf8mb4";
                    self::$instance = new PDO($dsn, $username, $password, [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                        PDO::ATTR_EMULATE_PREPARES => false,
                    ]);
                } else {
                    // SQLite storage for immediate local operation
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
                echo json_encode([
                    'error' => 'Database connection failed',
                    'message' => $e->getMessage()
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
