<?php
// Fimrash Logistics Services - Database connection and versioned schema migrations
// MySQL (Whogohost cPanel) in production, SQLite for zero-config local development.

namespace Fimrash;

use PDO;

class Database {
    private const SCHEMA_VERSION = 3;

    private static ?PDO $instance = null;

    public static function getConnection(): PDO {
        if (self::$instance !== null) {
            return self::$instance;
        }

        $driver = Config::get('driver', 'sqlite');
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ];

        if ($driver === 'mysql') {
            $dsn = sprintf(
                'mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4',
                Config::get('host', '127.0.0.1'),
                Config::get('port', '3306'),
                Config::get('database', 'fimrash_logistics')
            );
            $options[PDO::ATTR_EMULATE_PREPARES] = false;
            // All timestamps are stored in UTC; the API returns ISO-8601 with a Z suffix.
            // PHP 8.4+ moved the constant to Pdo\Mysql; shared hosts often still run 8.1-8.3.
            $initCommand = defined('Pdo\Mysql::ATTR_INIT_COMMAND') ? constant('Pdo\Mysql::ATTR_INIT_COMMAND') : PDO::MYSQL_ATTR_INIT_COMMAND;
            $options[$initCommand] ="SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci, time_zone = '+00:00'";
            $db = new PDO($dsn, Config::get('username', 'root'), Config::get('password', ''), $options);
        } else {
            $path = getenv('FIMRASH_SQLITE_PATH') ?: Config::storageDir() . '/fimrash.sqlite';
            $db = new PDO('sqlite:' . $path, null, null, $options);
            $db->exec('PRAGMA journal_mode = WAL');
            $db->exec('PRAGMA busy_timeout = 5000');
        }

        self::migrate($db);
        self::$instance = $db;
        return $db;
    }

    public static function driver(): string {
        return Config::get('driver', 'sqlite') === 'mysql' ? 'mysql' : 'sqlite';
    }

    public static function now(): string {
        return gmdate('Y-m-d H:i:s');
    }

    public static function newId(string $prefix): string {
        return $prefix . '_' . bin2hex(random_bytes(8));
    }

    // ── Migrations ──────────────────────────────────────────────

    private static function migrate(PDO $db): void {
        $db->exec('CREATE TABLE IF NOT EXISTS schema_migrations (version INT PRIMARY KEY, applied_at VARCHAR(32) NOT NULL)');
        $current = (int) $db->query('SELECT MAX(version) FROM schema_migrations')->fetchColumn();
        if ($current >= self::SCHEMA_VERSION) {
            return;
        }
        for ($v = $current + 1; $v <= self::SCHEMA_VERSION; $v++) {
            self::{'migration' . $v}($db);
            try {
                $db->prepare('INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)')->execute([$v, self::now()]);
            } catch (\PDOException $e) {
                // A concurrent request recorded the same version; every step is idempotent.
            }
        }
    }

    private static function hasColumn(PDO $db, string $table, string $column): bool {
        try {
            $db->query("SELECT {$column} FROM {$table} LIMIT 0");
            return true;
        } catch (\PDOException $e) {
            return false;
        }
    }

    private static function addColumn(PDO $db, string $table, string $column, string $definition): void {
        if (!self::hasColumn($db, $table, $column)) {
            $db->exec("ALTER TABLE {$table} ADD COLUMN {$column} {$definition}");
        }
    }

    private static function createIndex(PDO $db, string $name, string $table, string $columns): void {
        try {
            $db->exec("CREATE INDEX {$name} ON {$table} ({$columns})");
        } catch (\PDOException $e) {
            // Index already exists.
        }
    }

    // v1: the original tables (no-ops on databases created by the old schema.sql).
    private static function migration1(PDO $db): void {
        $db->exec("CREATE TABLE IF NOT EXISTS riders (
            id VARCHAR(32) PRIMARY KEY,
            name VARCHAR(128) NOT NULL,
            phone VARCHAR(32) NOT NULL,
            bike_number VARCHAR(32) NOT NULL,
            active_zone VARCHAR(32) DEFAULT 'Z1_CENTRAL',
            status VARCHAR(32) DEFAULT 'available',
            cash_in_hand DECIMAL(12, 2) DEFAULT 0.00,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");

        $db->exec("CREATE TABLE IF NOT EXISTS deliveries (
            id VARCHAR(32) PRIMARY KEY,
            tracking_code VARCHAR(32) UNIQUE NOT NULL,
            sender_type VARCHAR(32) DEFAULT 'home',
            sender_name VARCHAR(128) NOT NULL,
            sender_phone VARCHAR(32) NOT NULL,
            sender_landmark_id VARCHAR(64) NOT NULL,
            sender_landmark_detail VARCHAR(255),
            recipient_type VARCHAR(32) DEFAULT 'home',
            recipient_name VARCHAR(128) NOT NULL,
            recipient_phone VARCHAR(32) NOT NULL,
            recipient_landmark_id VARCHAR(64) NOT NULL,
            recipient_landmark_detail VARCHAR(255),
            item_category VARCHAR(64) NOT NULL,
            item_description VARCHAR(255),
            is_fragile BOOLEAN DEFAULT 0,
            special_instructions VARCHAR(255),
            payment_mode VARCHAR(32) DEFAULT 'pay_on_delivery',
            cod_amount DECIMAL(12, 2) DEFAULT 0.00,
            delivery_fee DECIMAL(12, 2) NOT NULL,
            otp_code VARCHAR(8) NOT NULL,
            otp_verified_at TIMESTAMP NULL,
            assigned_rider_id VARCHAR(32) NULL,
            status VARCHAR(32) DEFAULT 'pending',
            cod_collected_by_rider BOOLEAN DEFAULT 0,
            cod_remitted_to_vendor BOOLEAN DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");
    }

    // v2: real auth, hashed OTPs, audit trail, per-rider cash ledger, rate limiting.
    private static function migration2(PDO $db): void {
        self::addColumn($db, 'riders', 'pin_hash', 'VARCHAR(255) NULL');
        self::addColumn($db, 'riders', 'active', 'INT NOT NULL DEFAULT 1');
        // Legacy seeded riders had no credentials: keep them out of dispatch until an admin sets a PIN.
        $db->exec('UPDATE riders SET active = 0 WHERE pin_hash IS NULL');
        $db->exec("UPDATE riders SET status = 'available' WHERE status = 'on_delivery'");

        self::addColumn($db, 'deliveries', 'otp_hash', 'VARCHAR(64) NULL');
        self::addColumn($db, 'deliveries', 'otp_attempts', 'INT NOT NULL DEFAULT 0');
        self::addColumn($db, 'deliveries', 'otp_locked', 'INT NOT NULL DEFAULT 0');
        self::addColumn($db, 'deliveries', 'cancel_reason', 'VARCHAR(255) NULL');
        self::addColumn($db, 'deliveries', 'cod_payout_status', "VARCHAR(16) NOT NULL DEFAULT 'none'");
        self::addColumn($db, 'deliveries', 'cod_paid_at', 'VARCHAR(32) NULL');
        self::addColumn($db, 'deliveries', 'cod_payout_reference', 'VARCHAR(128) NULL');
        self::addColumn($db, 'deliveries', 'cod_paid_by', 'VARCHAR(40) NULL');

        // Hash any plaintext legacy OTPs, then blank the plaintext column.
        $secret = Config::appSecret();
        $rows = $db->query("SELECT id, otp_code FROM deliveries WHERE otp_hash IS NULL AND otp_code <> ''")->fetchAll();
        $update = $db->prepare("UPDATE deliveries SET otp_hash = ?, otp_code = '' WHERE id = ?");
        foreach ($rows as $row) {
            $update->execute([hash_hmac('sha256', $row['id'] . ':' . $row['otp_code'], $secret), $row['id']]);
        }
        $db->exec("UPDATE deliveries SET cod_payout_status = 'pending' WHERE status = 'delivered' AND cod_amount > 0 AND cod_payout_status = 'none'");

        $db->exec("CREATE TABLE IF NOT EXISTS admin_users (
            id VARCHAR(40) PRIMARY KEY,
            email VARCHAR(190) NOT NULL UNIQUE,
            name VARCHAR(128) NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            active INT NOT NULL DEFAULT 1,
            created_at VARCHAR(32) NOT NULL
        )");

        $db->exec("CREATE TABLE IF NOT EXISTS delivery_events (
            id VARCHAR(40) PRIMARY KEY,
            delivery_id VARCHAR(40) NOT NULL,
            event VARCHAR(32) NOT NULL,
            actor_role VARCHAR(16) NOT NULL,
            actor_id VARCHAR(40) NULL,
            note VARCHAR(255) NULL,
            created_at VARCHAR(32) NOT NULL
        )");

        $db->exec("CREATE TABLE IF NOT EXISTS cash_collections (
            id VARCHAR(40) PRIMARY KEY,
            delivery_id VARCHAR(40) NOT NULL UNIQUE,
            rider_id VARCHAR(40) NOT NULL,
            fee_cash DECIMAL(12, 2) NOT NULL,
            cod_cash DECIMAL(12, 2) NOT NULL,
            total_cash DECIMAL(12, 2) NOT NULL,
            status VARCHAR(16) NOT NULL DEFAULT 'held',
            remittance_id VARCHAR(40) NULL,
            collected_at VARCHAR(32) NOT NULL,
            remitted_at VARCHAR(32) NULL
        )");

        $db->exec("CREATE TABLE IF NOT EXISTS remittances (
            id VARCHAR(40) PRIMARY KEY,
            rider_id VARCHAR(40) NOT NULL,
            expected_amount DECIMAL(12, 2) NOT NULL,
            received_amount DECIMAL(12, 2) NOT NULL,
            admin_id VARCHAR(40) NOT NULL,
            note VARCHAR(255) NULL,
            created_at VARCHAR(32) NOT NULL
        )");

        $db->exec("CREATE TABLE IF NOT EXISTS rate_limits (
            bucket VARCHAR(64) PRIMARY KEY,
            hits INT NOT NULL,
            window_start INT NOT NULL
        )");

        self::createIndex($db, 'idx_deliveries_status', 'deliveries', 'status');
        self::createIndex($db, 'idx_deliveries_rider', 'deliveries', 'assigned_rider_id, status');
        self::createIndex($db, 'idx_events_delivery', 'delivery_events', 'delivery_id');
        self::createIndex($db, 'idx_cash_rider', 'cash_collections', 'rider_id, status');
        self::createIndex($db, 'idx_remit_rider', 'remittances', 'rider_id');
    }

    // v3: distance-based pricing, parcel size, "other area" locations, admin fee overrides.
    private static function migration3(PDO $db): void {
        self::addColumn($db, 'deliveries', 'parcel_size', "VARCHAR(16) NOT NULL DEFAULT 'small'");
        self::addColumn($db, 'deliveries', 'sender_other_area', 'VARCHAR(128) NULL');
        self::addColumn($db, 'deliveries', 'recipient_other_area', 'VARCHAR(128) NULL');
        self::addColumn($db, 'deliveries', 'distance_km', 'DECIMAL(6, 1) NULL');
        self::addColumn($db, 'deliveries', 'fee_breakdown', 'TEXT NULL');
        self::addColumn($db, 'deliveries', 'fee_overridden', 'INT NOT NULL DEFAULT 0');

        $db->exec("CREATE TABLE IF NOT EXISTS settings (
            k VARCHAR(64) PRIMARY KEY,
            v TEXT NOT NULL,
            updated_at VARCHAR(32) NOT NULL
        )");
    }
}
