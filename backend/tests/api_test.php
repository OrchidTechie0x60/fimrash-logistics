<?php
// Fimrash Logistics - end-to-end API test suite.
// Boots the API on PHP's built-in server against a throwaway SQLite database.
//
//   php backend/tests/api_test.php

declare(strict_types=1);

$root = dirname(__DIR__);
$tmp = sys_get_temp_dir() . '/fimrash_test_' . bin2hex(random_bytes(4));
mkdir($tmp, 0700, true);

$adminPassword = 'Correct-Horse-9';
file_put_contents("$tmp/config.php", '<?php return ' . var_export([
    'driver'          => 'sqlite',
    'app_secret'      => bin2hex(random_bytes(32)),
    'allowed_origins' => ['https://app.example.com'],
    'bootstrap_admin' => ['email' => 'ops@fimrash.test', 'name' => 'Test Ops', 'password' => $adminPassword],
    'debug'           => true,
], true) . ';');

$port = random_int(18000, 18999);
$env = array_merge(getenv(), ['FIMRASH_CONFIG' => "$tmp/config.php", 'FIMRASH_STORAGE' => $tmp]);
$server = proc_open(
    [PHP_BINARY, '-S', "127.0.0.1:$port", '-t', "$root/public", "$root/public/index.php"],
    [1 => ['file', "$tmp/server.log", 'a'], 2 => ['file', "$tmp/server.log", 'a']],
    $pipes, null, $env
);
register_shutdown_function(function () use ($server, $tmp) {
    proc_terminate($server);
    usleep(200000);
    foreach (glob("$tmp/*") as $f) { @unlink($f); }
    @rmdir($tmp);
});

$base = "http://127.0.0.1:$port";
for ($i = 0; $i < 50; $i++) {
    if (@file_get_contents("$base/api/health")) break;
    usleep(100000);
}

$passed = 0;
$failed = 0;

function call(string $method, string $path, ?array $body = null, ?string $token = null, array $headers = []): array {
    global $base;
    $ch = curl_init($base . $path);
    $h = ['Content-Type: application/json', ...$headers];
    if ($token) $h[] = "Authorization: Bearer $token";
    curl_setopt_array($ch, [
        CURLOPT_CUSTOMREQUEST  => $method,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER     => $h,
        CURLOPT_HEADER         => true,
    ]);
    if ($body !== null) curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
    $raw = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    curl_close($ch);
    return ['status' => $status, 'headers' => substr($raw, 0, $headerSize), 'json' => json_decode(substr($raw, $headerSize), true) ?? []];
}

function check(string $name, bool $ok, $detail = null): void {
    global $passed, $failed;
    if ($ok) { $passed++; echo "  ✓ $name\n"; }
    else { $failed++; echo "  ✗ $name" . ($detail !== null ? ' → ' . json_encode($detail) : '') . "\n"; }
}

function booking(array $overrides = []): array {
    return $overrides + [
        'sender_type' => 'home', 'sender_name' => 'Hafsat Bakes', 'sender_phone' => '0803 555 7788',
        'sender_landmark_id' => 'gyadi-gyadi', 'sender_landmark_detail' => 'House 8, Court Road',
        'recipient_type' => 'home', 'recipient_name' => 'Amina Sani', 'recipient_phone' => '+2348144445566',
        'recipient_landmark_id' => 'naibawa', 'recipient_landmark_detail' => 'Near Jallaba Mosque',
        'item_category' => 'Cakes, Pastries & Bakes', 'item_description' => 'Red velvet cake',
        'is_fragile' => true, 'payment_mode' => 'pay_on_delivery', 'cod_amount' => 15000,
    ];
}

echo "\nPublic surface\n";
$r = call('GET', '/api/health');
check('health is up', $r['status'] === 200 && $r['json']['status'] === 'healthy', $r);
check('health hides PHP version', !isset($r['json']['php_version']));
$r = call('GET', '/api/health', null, null, ['Origin: https://evil.example.com']);
check('CORS: unknown origin not allowed', !str_contains($r['headers'], 'Access-Control-Allow-Origin'));
$r = call('GET', '/api/health', null, null, ['Origin: https://app.example.com']);
check('CORS: configured origin allowed', str_contains($r['headers'], 'Access-Control-Allow-Origin: https://app.example.com'));

foreach ([['GET', '/api/deliveries'], ['GET', '/api/reconciliation'], ['GET', '/api/riders'], ['POST', '/api/riders/rdr_x/remit'], ['POST', '/api/deliveries/del_x/status'], ['POST', '/api/deliveries/del_x/verify-otp']] as [$m, $p]) {
    $r = call($m, $p, []);
    check("anonymous $m $p → 401", $r['status'] === 401, $r['status']);
}

echo "\nAuthentication\n";
$r = call('POST', '/api/auth/login', ['role' => 'admin', 'identifier' => 'admin', 'secret' => '1234']);
check('old "admin"/1234 backdoor rejected', $r['status'] === 401, $r);
check('error message does not leak a default PIN', !str_contains(json_encode($r['json']), '1234'));
$r = call('POST', '/api/auth/login', ['role' => 'admin', 'identifier' => 'OPS@fimrash.test', 'secret' => $adminPassword]);
check('bootstrap admin can sign in (email case-insensitive)', $r['status'] === 200 && !empty($r['json']['token']), $r);
$admin = $r['json']['token'] ?? '';
$forged = explode('.', $admin);
$forged[1] = rtrim(strtr(base64_encode(json_encode(['sub' => 'x', 'role' => 'admin', 'exp' => time() + 999])), '+/', '-_'), '=');
$r = call('GET', '/api/auth/me', null, implode('.', $forged));
check('tampered token rejected', $r['status'] === 401);

$r = call('POST', '/api/riders', ['name' => 'Musa Garba', 'phone' => '08156661246', 'bike_number' => 'kn-942-trn', 'active_zone' => 'Z2_COMMERCIAL_RESIDENTIAL', 'pin' => '1234'], $admin);
check('4-digit rider PIN rejected (6+ required)', $r['status'] === 422, $r);
$r = call('POST', '/api/riders', ['name' => 'Musa Garba', 'phone' => '08156661246', 'bike_number' => 'kn-942-trn', 'pin' => '123456'], $admin);
check('sequential 6-digit PIN rejected', $r['status'] === 422, $r);
$r = call('POST', '/api/riders', ['name' => 'Musa Garba', 'phone' => '08156661246', 'bike_number' => 'kn-942-trn', 'pin' => '111222'], $admin);
check('two-digit-repeat PIN rejected', $r['status'] === 422, $r);
$r = call('POST', '/api/riders', ['name' => 'Musa Garba', 'phone' => '08156661246', 'bike_number' => 'kn-942-trn', 'active_zone' => 'Z2_COMMERCIAL_RESIDENTIAL', 'pin' => '582194'], $admin);
check('admin creates rider', $r['status'] === 201 && $r['json']['rider']['bikeNumber'] === 'KN-942-TRN', $r);
$rider1Id = $r['json']['rider']['id'] ?? '';
$r = call('POST', '/api/riders', ['name' => 'Sani Usman', 'phone' => '08034567890', 'bike_number' => 'KN-781-TRN', 'active_zone' => 'Z4_OUTER_RING', 'pin' => '903571'], $admin);
$rider2Id = $r['json']['rider']['id'] ?? '';
$r = call('POST', '/api/riders', ['name' => 'Dupe', 'phone' => '08156661246', 'bike_number' => 'KN-000-AAA', 'pin' => '770719'], $admin);
check('duplicate rider phone rejected', $r['status'] === 422);

$r = call('POST', '/api/auth/login', ['role' => 'rider', 'identifier' => '+234 815 666 1246', 'secret' => '582194']);
check('rider signs in with phone in any format', $r['status'] === 200, $r);
$rider1 = $r['json']['token'] ?? '';
$r = call('POST', '/api/auth/login', ['role' => 'rider', 'identifier' => 'KN-781-TRN', 'secret' => '903571']);
check('rider signs in with bike plate', $r['status'] === 200, $r);
$rider2 = $r['json']['token'] ?? '';
$r = call('GET', '/api/reconciliation', null, $rider1);
check('rider cannot open the ledger (403)', $r['status'] === 403);

echo "\nBooking\n";
$r = call('POST', '/api/deliveries', booking(['recipient_phone' => '12345']));
check('invalid phone rejected', $r['status'] === 422 && ($r['json']['field'] ?? '') === 'recipient_phone', $r);
$r = call('POST', '/api/deliveries', booking(['recipient_landmark_id' => 'atlantis']));
check('unknown landmark rejected', $r['status'] === 422);
$r = call('POST', '/api/deliveries', booking(['recipient_name' => '']));
check('missing recipient name rejected (no silent fake defaults)', $r['status'] === 422);
$r = call('POST', '/api/deliveries', booking(['otp_code' => '0000', 'tracking_code' => 'FMR-KN-0001', 'delivery_fee' => 1, 'id' => 'del_hack']));
$d1 = $r['json']['delivery'] ?? [];
check('booking created', $r['status'] === 201, $r);
check('client-chosen tracking code ignored', ($d1['trackingCode'] ?? '') !== 'FMR-KN-0001' && preg_match('/^FMR-KN-[2-9A-Z]{6}$/', $d1['trackingCode'] ?? ''));
check('client-chosen id ignored', ($d1['id'] ?? '') !== 'del_hack');
$q = call('POST', '/api/quote', ['pickup_landmark_id' => 'gyadi-gyadi', 'dropoff_landmark_id' => 'naibawa', 'is_fragile' => true, 'cod_amount' => 15000])['json'];
$fee1 = $d1['deliveryFee'] ?? 0;
check('fee is server-calculated and matches the public quote', $fee1 == ($q['fee'] ?? -1) && $fee1 >= 1500, ['fee' => $fee1, 'quote' => $q]);
check('fee is rounded up to the ₦100 step', fmod($fee1, 100) == 0.0, $fee1);
check('distance and breakdown are recorded', ($d1['distanceKm'] ?? 0) > 0 && isset($d1['feeBreakdown']['distance'], $d1['feeBreakdown']['cod']), $d1['feeBreakdown'] ?? null);
check('phones normalised', ($d1['senderPhone'] ?? '') === '08035557788' && ($d1['recipientPhone'] ?? '') === '08144445566');
check('auto-assigned to in-zone rider', ($d1['status'] ?? '') === 'assigned' && ($d1['assignedRider']['id'] ?? '') === $rider1Id, $d1);
check('amount due = fee + CoD', ($d1['amountDue'] ?? 0) == $fee1 + 15000);
$otp1 = $d1['otp'] ?? '';
check('OTP is 4 digits', (bool) preg_match('/^\d{4}$/', $otp1));

echo "\nPublic tracking & privacy\n";
$r = call('GET', '/api/track/' . strtolower($d1['trackingCode']));
$pub = $r['json']['delivery'] ?? [];
$pubJson = json_encode($pub);
check('track by code (case-insensitive)', $r['status'] === 200 && $pub['status'] === 'assigned', $r);
check('no OTP in public tracking', !str_contains($pubJson, $otp1) && !isset($pub['otp']));
check('no customer phones in public tracking', !str_contains($pubJson, '08144445566') && !str_contains($pubJson, '08035557788'));
check('no street addresses in public tracking', !str_contains($pubJson, 'Court Road') && !str_contains($pubJson, 'Jallaba'));
check('recipient name masked', $pub['recipientName'] === 'Amina S.', $pub['recipientName'] ?? null);
check('timeline has timestamps', count($pub['timeline']) === 2 && str_ends_with($pub['timeline'][0]['at'], 'Z'), $pub['timeline'] ?? null);
check('unknown code → 404', call('GET', '/api/track/FMR-KN-ZZZZZZ')['status'] === 404);

echo "\nRider workflow & state machine\n";
$r = call('GET', '/api/deliveries', null, $rider1);
check('rider sees own job', count($r['json']['deliveries'] ?? []) === 1, $r);
check('rider list has no OTP', !str_contains(json_encode($r['json']), $otp1) || $otp1 === '');
check('rider2 sees nothing', count(call('GET', '/api/deliveries', null, $rider2)['json']['deliveries'] ?? [1]) === 0);
check('other rider cannot update job', call('POST', "/api/deliveries/{$d1['id']}/status", ['status' => 'picked_up'], $rider2)['status'] === 404);
check('verify before pickup → 409', call('POST', "/api/deliveries/{$d1['id']}/verify-otp", ['otp' => $otp1], $rider1)['status'] === 409);
check('skip assigned→arrived → 409', call('POST', "/api/deliveries/{$d1['id']}/status", ['status' => 'arrived'], $rider1)['status'] === 409);
check('cannot set delivered via /status', call('POST', "/api/deliveries/{$d1['id']}/status", ['status' => 'delivered'], $rider1)['status'] === 409);
foreach (['picked_up', 'in_transit', 'arrived'] as $s) {
    $r = call('POST', "/api/deliveries/{$d1['id']}/status", ['status' => $s], $rider1);
    check("→ $s", $r['status'] === 200 && $r['json']['delivery']['status'] === $s, $r);
}
check('cannot go backwards arrived→picked_up', call('POST', "/api/deliveries/{$d1['id']}/status", ['status' => 'picked_up'], $rider1)['status'] === 409);

$wrong = $otp1 === '0000' ? '1111' : '0000';
$r = call('POST', "/api/deliveries/{$d1['id']}/verify-otp", ['otp' => $wrong], $rider1);
check('wrong OTP rejected with attempts remaining', $r['status'] === 422 && $r['json']['attemptsRemaining'] === 4, $r);
$r = call('POST', "/api/deliveries/{$d1['id']}/verify-otp", ['otp' => $otp1], $rider1);
check('correct OTP completes delivery', $r['status'] === 200 && $r['json']['delivery']['status'] === 'delivered', $r);
check('cash collected = fee + CoD', ($r['json']['cashCollected'] ?? 0) == $fee1 + 15000);
$r = call('POST', "/api/deliveries/{$d1['id']}/verify-otp", ['otp' => $otp1], $rider1);
check('replayed OTP does not double-count cash (409)', $r['status'] === 409);
$r = call('GET', '/api/deliveries', null, $rider1);
check('rider cash held unchanged after replay', ($r['json']['cashHeld'] ?? 0) == $fee1 + 15000, $r['json']['cashHeld'] ?? null);

echo "\nOTP lockout & reset\n";
$r = call('POST', '/api/deliveries', booking(['payment_mode' => 'prepaid', 'cod_amount' => 0, 'sender_landmark_id' => 'kwari-textiles', 'recipient_landmark_id' => 'nassarawa-gra']));
$d2 = $r['json']['delivery'];
call('POST', "/api/deliveries/{$d2['id']}/assign", ['rider_id' => $rider1Id], $admin);
check('picked up by assigned rider', call('POST', "/api/deliveries/{$d2['id']}/status", ['status' => 'picked_up'], $rider1)['status'] === 200);
$wrong = $d2['otp'] === '0000' ? '1111' : '0000';
for ($i = 0; $i < 5; $i++) {
    $r = call('POST', "/api/deliveries/{$d2['id']}/verify-otp", ['otp' => $wrong], $rider1);
}
check('5th wrong attempt locks delivery', $r['status'] === 422 && $r['json']['locked'] === true, $r);
$r = call('POST', "/api/deliveries/{$d2['id']}/verify-otp", ['otp' => $d2['otp']], $rider1);
check('locked delivery rejects even the right code (423)', $r['status'] === 423, $r);
$r = call('POST', "/api/deliveries/{$d2['id']}/reset-otp", [], $admin);
check('admin issues a new code', $r['status'] === 200 && preg_match('/^\d{4}$/', $r['json']['otp']), $r);
$newOtp = $r['json']['otp'];
$r = call('POST', "/api/deliveries/{$d2['id']}/verify-otp", ['otp' => $newOtp], $rider1);
check('new code works; prepaid with no CoD collects ₦0', $r['status'] === 200 && $r['json']['cashCollected'] == 0, $r);

echo "\nAdmin operations & ledger\n";
$r = call('POST', '/api/deliveries', booking(['sender_landmark_id' => 'dawanau-market', 'recipient_landmark_id' => 'sharada-industrial']));
$d3 = $r['json']['delivery'];
check('outer-ring booking goes to outer-ring rider', ($d3['assignedRider']['id'] ?? '') === $rider2Id, $d3['assignedRider'] ?? null);
$r = call('POST', "/api/deliveries/{$d3['id']}/assign", ['rider_id' => $rider1Id], $admin);
check('admin reassigns before pickup', $r['status'] === 200 && $r['json']['delivery']['assignedRider']['id'] === $rider1Id);
$r = call('POST', "/api/deliveries/{$d3['id']}/cancel", ['reason' => ''], $admin);
check('cancel requires a reason', $r['status'] === 422);
$r = call('POST', "/api/deliveries/{$d3['id']}/cancel", ['reason' => 'Customer cancelled'], $admin);
check('admin cancels', $r['status'] === 200 && $r['json']['delivery']['status'] === 'cancelled');
check('cannot cancel a delivered order', call('POST', "/api/deliveries/{$d1['id']}/cancel", ['reason' => 'x'], $admin)['status'] === 409);

$r = call('GET', '/api/reconciliation', null, $admin);
$s = $r['json']['summary'] ?? [];
check('ledger: cash held by riders = fee + CoD', ($s['cashHeldByRiders'] ?? 0) == $fee1 + 15000, $s);
check('ledger: CoD awaiting vendor payout ₦15,000', ($s['codPendingPayout'] ?? 0) == 15000, $s);
check('ledger: revenue counts delivered fees only', ($s['revenue'] ?? 0) == $fee1 + $d2['deliveryFee'], $s);

$r = call('POST', "/api/riders/$rider1Id/remit", ['received_amount' => $fee1 + 15000 - 500, 'note' => 'Short ₦500'], $admin);
check('remit records shortfall', $r['status'] === 200 && $r['json']['remittance']['shortfall'] == 500, $r);
check('second remit has nothing to collect (409)', call('POST', "/api/riders/$rider1Id/remit", ['received_amount' => 0], $admin)['status'] === 409);
$s = call('GET', '/api/reconciliation', null, $admin)['json']['summary'];
check('remitting rider cash does NOT mark vendor CoD as paid', $s['cashHeldByRiders'] == 0 && $s['codPendingPayout'] == 15000, $s);
$r = call('POST', "/api/deliveries/{$d1['id']}/cod-payout", ['reference' => 'GTB-TRF-88812'], $admin);
check('vendor CoD payout recorded', $r['status'] === 200 && $r['json']['delivery']['codPayoutStatus'] === 'paid', $r);
check('payout is not repeatable', call('POST', "/api/deliveries/{$d1['id']}/cod-payout", ['reference' => 'again'], $admin)['status'] === 409);
$s = call('GET', '/api/reconciliation', null, $admin)['json']['summary'];
check('ledger: CoD pending ₦0, paid ₦15,000', $s['codPendingPayout'] == 0 && $s['codPaidOut'] == 15000, $s);

echo "\nPricing, other areas & fee overrides\n";
$rates = call('GET', '/api/pricing')['json']['rates'] ?? [];
check('public rate card is readable', isset($rates['base'], $rates['perKm'], $rates['minimum']), $rates);
$small = call('POST', '/api/quote', ['pickup_landmark_id' => 'kwari-textiles', 'dropoff_landmark_id' => 'buk-new-campus'])['json'];
$large = call('POST', '/api/quote', ['pickup_landmark_id' => 'kwari-textiles', 'dropoff_landmark_id' => 'buk-new-campus', 'parcel_size' => 'large'])['json'];
check('larger parcels cost more', ($large['fee'] ?? 0) > ($small['fee'] ?? 0), [$small, $large]);
$near = call('POST', '/api/quote', ['pickup_landmark_id' => 'kwari-textiles', 'dropoff_landmark_id' => 'singer-market'])['json'];
check('short hops pay at least the minimum', ($near['fee'] ?? 0) >= $rates['minimum'], $near);
check('longer trips cost more than short hops', ($small['fee'] ?? 0) > ($near['fee'] ?? 0));
check('new areas are bookable (Kumbotso → Airport)', call('POST', '/api/quote', ['pickup_landmark_id' => 'kumbotso', 'dropoff_landmark_id' => 'aminu-kano-airport'])['status'] === 200);

$r = call('POST', '/api/deliveries', booking(['sender_landmark_id' => 'other', 'sender_other_area' => '']));
check('"other" pickup needs an area name', $r['status'] === 422 && ($r['json']['field'] ?? '') === 'sender_other_area', $r);
$r = call('POST', '/api/deliveries', booking(['sender_landmark_id' => 'other', 'sender_other_area' => 'Kawo Mai Gari']));
check('"other" pickup needs the nearest known area', $r['status'] === 422 && ($r['json']['field'] ?? '') === 'sender_near_landmark_id', $r);
$r = call('POST', '/api/deliveries', booking(['sender_landmark_id' => 'other', 'sender_other_area' => 'Kawo Mai Gari', 'sender_near_landmark_id' => 'bachirawa', 'parcel_size' => 'medium']));
$d4 = $r['json']['delivery'] ?? [];
check('"other" pickup books against the nearest area', $r['status'] === 201 && $d4['senderLandmarkId'] === 'bachirawa' && $d4['senderOtherArea'] === 'Kawo Mai Gari' && $d4['parcelSize'] === 'medium', $d4);

$saved = call('POST', '/api/pricing', ['perKm' => 300, 'minimum' => 2000], $admin);
check('admin updates rates', $saved['status'] === 200 && $saved['json']['rates']['perKm'] == 300, $saved);
check('riders cannot change rates', call('POST', '/api/pricing', ['perKm' => 1], $rider1)['status'] === 403);
check('out-of-range rate rejected', call('POST', '/api/pricing', ['perKm' => -5], $admin)['status'] === 422);
$after = call('POST', '/api/quote', ['pickup_landmark_id' => 'kwari-textiles', 'dropoff_landmark_id' => 'buk-new-campus'])['json'];
check('quotes follow the new rates', ($after['fee'] ?? 0) > ($small['fee'] ?? 0), [$small, $after]);

$r = call('POST', "/api/deliveries/{$d4['id']}/fee", ['fee' => 7500, 'reason' => 'Two cartons, extra trip'], $admin);
check('admin overrides a fee before delivery', $r['status'] === 200 && $r['json']['delivery']['deliveryFee'] == 7500 && $r['json']['delivery']['feeOverridden'] === true, $r);
check('override needs a reason', call('POST', "/api/deliveries/{$d4['id']}/fee", ['fee' => 8000, 'reason' => ''], $admin)['status'] === 422);
check('delivered fees are locked', call('POST', "/api/deliveries/{$d1['id']}/fee", ['fee' => 100, 'reason' => 'x'], $admin)['status'] === 409);

echo "\nRevocation & rate limiting\n";
call('POST', "/api/riders/$rider2Id", ['active' => false], $admin);
check('deactivated rider token stops working', call('GET', '/api/auth/me', null, $rider2)['status'] === 401);
// A couple of typos followed by the right PIN must still work, and reset the counter.
call('POST', '/api/auth/login', ['role' => 'rider', 'identifier' => '08156661246', 'secret' => '000999']);
call('POST', '/api/auth/login', ['role' => 'rider', 'identifier' => 'KN-942-TRN', 'secret' => '000999']);
check('right PIN after 2 typos still signs in', call('POST', '/api/auth/login', ['role' => 'rider', 'identifier' => '08156661246', 'secret' => '582194'])['status'] === 200);

$codes = [];
foreach (['08156661246', 'KN-942-TRN', '+2348156661246', 'kn-942-trn', '08156661246', '08156661246'] as $spelling) {
    $codes[] = call('POST', '/api/auth/login', ['role' => 'rider', 'identifier' => $spelling, 'secret' => '000999'])['status'];
}
check('wrong PINs across phone/plate spellings share one budget (6th → 429)', $codes === [401, 401, 401, 401, 401, 429], $codes);
$r = call('POST', '/api/auth/login', ['role' => 'rider', 'identifier' => '08156661246', 'secret' => '582194']);
check('locked account refuses even the right PIN until the window passes', $r['status'] === 429 && isset($r['json']['retryAfter']), $r);

$unknown = [];
for ($i = 0; $i < 6; $i++) {
    $unknown[] = call('POST', '/api/auth/login', ['role' => 'rider', 'identifier' => '08099999999', 'secret' => '000999'])['status'];
}
check('unknown accounts throttle identically (no account enumeration)', $unknown === [401, 401, 401, 401, 401, 429], $unknown);

$probe = [];
for ($i = 0; $i < 60; $i++) {
    $probe[] = call('GET', '/api/riders')['status'];
}
check('anonymous probing of internal endpoints throttled', in_array(429, $probe, true));

echo "\n$passed passed, $failed failed\n";
if ($failed) {
    echo "\nServer log:\n" . @file_get_contents("$tmp/server.log");
}
exit($failed ? 1 : 0);
