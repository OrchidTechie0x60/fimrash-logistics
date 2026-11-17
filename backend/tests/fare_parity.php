<?php
// Fails if frontend/src/data/kanoLandmarks.js and backend/src/Pricing.php quote different fares.
//   php backend/tests/fare_parity.php   (requires node on PATH)

declare(strict_types=1);

require_once __DIR__ . '/../src/Http.php';
require_once __DIR__ . '/../src/Pricing.php';

use Fimrash\Pricing;

$jsFile = realpath(__DIR__ . '/../../frontend/src/data/kanoLandmarks.js');
$script = "import('" . 'file:///' . ltrim(str_replace(DIRECTORY_SEPARATOR, '/', $jsFile), '/') . "').then(m => {"
    . "const out = {}; const ids = m.KANO_LANDMARKS.map(l => l.id);"
    . "for (const a of ids) for (const b of ids) out[a + '|' + b] = m.calculateDeliveryFare(a, b);"
    . "console.log(JSON.stringify({ zones: Object.fromEntries(m.KANO_LANDMARKS.map(l => [l.id, l.zoneId])), fares: out }));"
    . "})";
$json = shell_exec('node -e ' . escapeshellarg($script));
$js = json_decode((string) $json, true);
if (!$js) {
    fwrite(STDERR, "Could not evaluate kanoLandmarks.js with node\n");
    exit(1);
}

$errors = [];
if ($js['zones'] != Pricing::LANDMARK_ZONES) {
    $errors[] = 'Landmark → zone maps differ: ' . json_encode(array_diff_assoc($js['zones'], Pricing::LANDMARK_ZONES) + array_diff_assoc(Pricing::LANDMARK_ZONES, $js['zones']));
}
foreach ($js['fares'] as $pair => $jsFare) {
    [$a, $b] = explode('|', $pair);
    $phpFare = Pricing::isLandmark($a) && Pricing::isLandmark($b) ? Pricing::fare($a, $b) : null;
    if ((float) $jsFare !== $phpFare) {
        $errors[] = "$a → $b: JS ₦$jsFare vs PHP ₦" . var_export($phpFare, true);
    }
}

if ($errors) {
    echo "Fare parity FAILED:\n  " . implode("\n  ", $errors) . "\n";
    exit(1);
}
echo 'Fare parity OK (' . count($js['fares']) . " landmark pairs)\n";
