<?php
// Fimrash Logistics Services - command-line administration
//
//   php bin/manage.php create-admin <email> "<name>"        (prompts for password)
//   php bin/manage.php reset-admin-password <email>          (prompts for password)
//   php bin/manage.php set-rider-pin <rider-id|phone>        (prompts for PIN, activates rider)
//   php bin/manage.php list-riders

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require_once __DIR__ . '/../src/Config.php';
require_once __DIR__ . '/../src/Http.php';
require_once __DIR__ . '/../src/Database.php';
require_once __DIR__ . '/../src/Auth.php';

use Fimrash\{Auth, Database, Http, HttpException};

function prompt(string $label): string {
    echo $label;
    if (DIRECTORY_SEPARATOR === '/') {
        system('stty -echo');
        $value = trim((string) fgets(STDIN));
        system('stty echo');
        echo PHP_EOL;
        return $value;
    }
    return trim((string) fgets(STDIN));
}

function fail(string $message): never {
    fwrite(STDERR, "Error: {$message}" . PHP_EOL);
    exit(1);
}

$db = Database::getConnection();
$command = $argv[1] ?? '';

try {
    switch ($command) {
        case 'create-admin':
            $email = strtolower(trim($argv[2] ?? ''));
            $name = trim($argv[3] ?? 'Station Controller');
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                fail('Provide a valid email address');
            }
            $password = prompt('Password (min 10 chars): ');
            Auth::validatePassword($password);
            $db->prepare('INSERT INTO admin_users (id, email, name, password_hash, active, created_at) VALUES (?, ?, ?, ?, 1, ?)')
                ->execute([Database::newId('adm'), $email, $name, Auth::hashSecret($password), Database::now()]);
            echo "Admin {$email} created." . PHP_EOL;
            break;

        case 'reset-admin-password':
            $email = strtolower(trim($argv[2] ?? ''));
            $password = prompt('New password (min 10 chars): ');
            Auth::validatePassword($password);
            $stmt = $db->prepare('UPDATE admin_users SET password_hash = ?, active = 1 WHERE email = ?');
            $stmt->execute([Auth::hashSecret($password), $email]);
            $stmt->rowCount() ? print("Password updated for {$email}." . PHP_EOL) : fail('No admin with that email');
            break;

        case 'set-rider-pin':
            $ref = trim($argv[2] ?? '');
            $phone = Http::normalisePhone($ref) ?? '__none__';
            $pin = prompt('New PIN (6-8 digits): ');
            Auth::validatePin($pin);
            $stmt = $db->prepare('UPDATE riders SET pin_hash = ?, active = 1 WHERE id = ? OR phone = ?');
            $stmt->execute([Auth::hashSecret($pin), $ref, $phone]);
            $stmt->rowCount() ? print('PIN set and rider activated.' . PHP_EOL) : fail('No rider matches that ID or phone');
            break;

        case 'list-riders':
            foreach ($db->query('SELECT id, name, phone, bike_number, active, CASE WHEN pin_hash IS NULL THEN 0 ELSE 1 END AS has_pin FROM riders ORDER BY name') as $r) {
                printf("%-14s %-24s %-12s %-12s %s %s\n", $r['id'], $r['name'], $r['phone'], $r['bike_number'], $r['active'] ? 'active' : 'inactive', $r['has_pin'] ? '' : '(no PIN)');
            }
            break;

        default:
            echo file_get_contents(__FILE__, false, null, 0, 600);
            exit(1);
    }
} catch (HttpException $e) {
    fail($e->getMessage());
} catch (\PDOException $e) {
    fail(str_contains($e->getMessage(), 'UNIQUE') || str_contains($e->getMessage(), 'Duplicate') ? 'That account already exists' : $e->getMessage());
}
