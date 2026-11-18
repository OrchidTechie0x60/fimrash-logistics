<?php
// Fimrash Logistics Services - REST API entry point (Whogohost cPanel / PHP built-in server)

declare(strict_types=1);

require_once __DIR__ . '/../src/Config.php';
require_once __DIR__ . '/../src/Http.php';
require_once __DIR__ . '/../src/Database.php';
require_once __DIR__ . '/../src/Auth.php';
require_once __DIR__ . '/../src/RateLimiter.php';
require_once __DIR__ . '/../src/Pricing.php';
require_once __DIR__ . '/../src/Sms.php';
require_once __DIR__ . '/../src/Api.php';

use Fimrash\{Api, Config, Database, Http, HttpException};

ini_set('display_errors', '0');

Http::sendCors();
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Resolve the route whether the API lives at a domain root, a subdirectory, or behind ?route=.
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$scriptDir = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '')), '/');
if ($scriptDir !== '' && str_starts_with($path, $scriptDir)) {
    $path = substr($path, strlen($scriptDir));
}
if (str_starts_with($path, '/index.php')) {
    $path = substr($path, strlen('/index.php'));
}
if (isset($_GET['route'])) {
    $path = (string) $_GET['route'];
}
$path = '/' . trim($path, '/');
$method = $_SERVER['REQUEST_METHOD'];

$id = '([A-Za-z0-9_\-]{1,40})';
$routes = [
    ['GET',  '#^/(api/)?health$#',                   'health'],
    ['GET',  '#^/api/pricing$#',                     'pricing'],
    ['POST', '#^/api/pricing$#',                     'savePricing'],
    ['POST', '#^/api/quote$#',                       'quote'],
    ['POST', '#^/api/auth/login$#',                  'login'],
    ['GET',  '#^/api/auth/me$#',                     'me'],
    ['POST', '#^/api/auth/change-secret$#',          'changeSecret'],
    ['GET',  "#^/api/track/{$id}$#",                 'track'],
    ['GET',  '#^/api/deliveries$#',                  'listDeliveries'],
    ['POST', '#^/api/deliveries$#',                  'createDelivery'],
    ['GET',  "#^/api/deliveries/{$id}$#",            'getDelivery'],
    ['POST', "#^/api/deliveries/{$id}/status$#",     'updateStatus'],
    ['POST', "#^/api/deliveries/{$id}/verify-otp$#", 'verifyOtp'],
    ['POST', "#^/api/deliveries/{$id}/assign$#",     'assign'],
    ['POST', "#^/api/deliveries/{$id}/cancel$#",     'cancel'],
    ['POST', "#^/api/deliveries/{$id}/reset-otp$#",  'resetOtp'],
    ['POST', "#^/api/deliveries/{$id}/cod-payout$#", 'codPayout'],
    ['POST', "#^/api/deliveries/{$id}/fee$#",        'overrideFee'],
    ['POST', '#^/api/rider/availability$#',          'setAvailability'],
    ['GET',  '#^/api/riders$#',                      'listRiders'],
    ['POST', '#^/api/riders$#',                      'saveRider'],
    ['POST', "#^/api/riders/{$id}$#",                'saveRider'],
    ['POST', "#^/api/riders/{$id}/remit$#",          'remit'],
    ['GET',  '#^/api/reconciliation$#',              'reconciliation'],
];

try {
    $matched = null;
    $pathExists = false;
    foreach ($routes as [$verb, $pattern, $handler]) {
        if (preg_match($pattern, $path, $m)) {
            $pathExists = true;
            if ($verb === $method) {
                $matched = [$handler, array_slice($m, 1)];
                break;
            }
        }
    }
    if (!$matched) {
        throw new HttpException($pathExists ? 405 : 404, $pathExists ? 'Method not allowed' : 'Endpoint not found');
    }

    [$handler, $params] = $matched;
    // Drop the optional "api/" capture group used by the health route.
    $params = array_values(array_filter($params, fn ($p) => $p !== '' && $p !== 'api/'));
    if ($handler === 'saveRider' && !$params) {
        $params = [null];
    }

    $api = new Api(Database::getConnection());
    $api->$handler(...$params);
} catch (HttpException $e) {
    Http::json(['error' => $e->getMessage()] + $e->extra, $e->getCode());
} catch (\Throwable $e) {
    error_log('[Fimrash API] ' . get_class($e) . ': ' . $e->getMessage() . ' @ ' . $e->getFile() . ':' . $e->getLine());
    $body = ['error' => 'Something went wrong on our side. Please try again.'];
    try {
        if (Config::isDebug()) {
            $body['details'] = $e->getMessage();
        }
    } catch (\Throwable) {
    }
    Http::json($body, 500);
}
