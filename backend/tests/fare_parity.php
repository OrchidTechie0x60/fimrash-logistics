<?php
// Fails if the frontend (lib/pricingCore.js + data/kanoLandmarks.js) and the backend (Pricing.php)
// would quote different fares, distances or zones.
//   php backend/tests/fare_parity.php   (requires node on PATH)

declare(strict_types=1);

require_once __DIR__ . '/../src/Http.php';
require_once __DIR__ . '/../src/Pricing.php';

use Fimrash\Pricing;

$toUrl = fn (string $path) => 'file:///' . ltrim(str_replace(DIRECTORY_SEPARATOR, '/', realpath($path)), '/');
$core = $toUrl(__DIR__ . '/../../frontend/src/lib/pricingCore.js');
$data = $toUrl(__DIR__ . '/../../frontend/src/data/kanoLandmarks.js');

$cases = [['small', false, 0], ['medium', true, 0], ['large', false, 25000], ['small', true, 3000]];
$script = "Promise.all([import('$core'), import('$data')]).then(([p, d]) => {"
    . 'const cases = ' . json_encode($cases) . ';'
    . 'const out = {}; const ids = d.KANO_LANDMARKS.map(l => l.id);'
    . 'for (const a of ids) for (const b of ids) cases.forEach(([size, fragile, cod], i) => {'
    . '  const q = p.quote(p.DEFAULT_RATES, a, b, { size, fragile, cod }); out[a + "|" + b + "|" + i] = [q.fee, q.km, q.minutes]; });'
    . 'console.log(JSON.stringify({ zones: Object.fromEntries(d.KANO_LANDMARKS.map(l => [l.id, [l.zoneId, l.lat, l.lng]])), rates: p.DEFAULT_RATES, quotes: out }));'
    . '})';
// Run from a temp file: Windows shell quoting mangles inline scripts.
$tmp = tempnam(sys_get_temp_dir(), 'parity') . '.mjs';
file_put_contents($tmp, $script);
$json = shell_exec('node ' . escapeshellarg($tmp));
@unlink($tmp);
$js = json_decode((string) $json, true);
if (!$js) {
    fwrite(STDERR, "Could not evaluate the frontend pricing with node\n");
    exit(1);
}

$errors = [];
if ($js['rates'] != Pricing::DEFAULT_RATES) {
    $errors[] = 'Default rates differ: JS ' . json_encode($js['rates']) . ' vs PHP ' . json_encode(Pricing::DEFAULT_RATES);
}
foreach (Pricing::LANDMARKS as $id => $meta) {
    if (($js['zones'][$id] ?? null) != $meta) {
        $errors[] = "Landmark {$id}: JS " . json_encode($js['zones'][$id] ?? 'missing') . ' vs PHP ' . json_encode($meta);
    }
}
foreach (array_diff(array_keys($js['zones']), array_keys(Pricing::LANDMARKS)) as $extra) {
    $errors[] = "Landmark {$extra} exists only in the frontend";
}
foreach ($js['quotes'] as $key => [$fee, $km, $minutes]) {
    [$a, $b, $i] = explode('|', $key);
    if (!Pricing::isLandmark($a) || !Pricing::isLandmark($b)) {
        continue;
    }
    [$size, $fragile, $cod] = $cases[(int) $i];
    $php = Pricing::quote(Pricing::DEFAULT_RATES, $a, $b, $size, $fragile, (float) $cod);
    if ((float) $fee !== $php['fee'] || (float) $km !== (float) $php['km'] || (int) $minutes !== $php['minutes']) {
        $errors[] = "{$a} → {$b} ({$size}" . ($fragile ? ', fragile' : '') . ($cod ? ", CoD {$cod}" : '') . "): JS ₦{$fee}/{$km}km/{$minutes}min vs PHP ₦{$php['fee']}/{$php['km']}km/{$php['minutes']}min";
    }
}

if ($errors) {
    echo "Fare parity FAILED (" . count($errors) . "):\n  " . implode("\n  ", array_slice($errors, 0, 20)) . "\n";
    exit(1);
}
echo 'Fare parity OK (' . count($js['quotes']) . " quotes across " . count(Pricing::LANDMARKS) . " landmarks)\n";
