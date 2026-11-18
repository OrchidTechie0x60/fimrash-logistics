<?php
// Fimrash Logistics Services - Authoritative landmark registry and distance-based pricing.
//
// fee = base + perKm × road km + size surcharge + fragile surcharge + CoD handling,
//       never below the minimum, rounded UP to the rounding step.
// road km = straight-line distance between landmark coordinates × ROAD_FACTOR.
// Rates live in the settings table (editable by admins in Station Ops → Pricing).
// Must stay in sync with frontend/src/data/kanoLandmarks.js + lib/pricing.js;
// tests/fare_parity.php enforces it.

namespace Fimrash;

use PDO;

class Pricing {
    // id => [zone, lat, lng]. Coordinates are approximate area centres, good to a few hundred metres.
    public const LANDMARKS = [
        // Zone 1: central markets & old city
        'kwari-textiles'      => ['Z1_CENTRAL', 12.0035, 8.5225],
        'singer-market'       => ['Z1_CENTRAL', 12.0075, 8.5215],
        'sabon-gari'          => ['Z1_CENTRAL', 12.0120, 8.5340],
        'kofar-wambai'        => ['Z1_CENTRAL', 11.9985, 8.5120],
        'bata-fagge'          => ['Z1_CENTRAL', 12.0090, 8.5300],
        'kurmi-market'        => ['Z1_CENTRAL', 11.9975, 8.5060],
        'gidan-sarki'         => ['Z1_CENTRAL', 11.9935, 8.5175],
        'kofar-mata'          => ['Z1_CENTRAL', 11.9905, 8.5065],
        'gwammaja'            => ['Z1_CENTRAL', 12.0060, 8.5050],
        'dala'                => ['Z1_CENTRAL', 12.0015, 8.4975],
        // Zone 2: midtown
        'gyadi-gyadi'         => ['Z2_COMMERCIAL_RESIDENTIAL', 11.9690, 8.5330],
        'farm-centre'         => ['Z2_COMMERCIAL_RESIDENTIAL', 11.9760, 8.5420],
        'zoo-road'            => ['Z2_COMMERCIAL_RESIDENTIAL', 11.9780, 8.5260],
        'post-office-murtala' => ['Z2_COMMERCIAL_RESIDENTIAL', 11.9950, 8.5370],
        'bompai'              => ['Z2_COMMERCIAL_RESIDENTIAL', 12.0200, 8.5500],
        'gadon-kaya'          => ['Z2_COMMERCIAL_RESIDENTIAL', 11.9770, 8.5060],
        'kofar-nassarawa'     => ['Z2_COMMERCIAL_RESIDENTIAL', 11.9900, 8.5280],
        // Zone 3: residential, estates & campuses
        'naibawa'             => ['Z3_RESIDENTIAL_METRO', 11.9330, 8.5420],
        'yankatako'           => ['Z3_RESIDENTIAL_METRO', 11.9260, 8.5450],
        'nassarawa-gra'       => ['Z3_RESIDENTIAL_METRO', 12.0010, 8.5470],
        'hotoro-gra'          => ['Z3_RESIDENTIAL_METRO', 11.9900, 8.5700],
        'tarauni-gra'         => ['Z3_RESIDENTIAL_METRO', 11.9620, 8.5500],
        'janbulo-dorayi'      => ['Z3_RESIDENTIAL_METRO', 11.9730, 8.4800],
        'buk-new-campus'      => ['Z3_RESIDENTIAL_METRO', 11.9770, 8.4280],
        'buk-old-campus'      => ['Z3_RESIDENTIAL_METRO', 11.9840, 8.4730],
        'badawa'              => ['Z3_RESIDENTIAL_METRO', 12.0200, 8.5650],
        'dakata'              => ['Z3_RESIDENTIAL_METRO', 12.0400, 8.5700],
        'gwale'               => ['Z3_RESIDENTIAL_METRO', 11.9850, 8.4970],
        'sheka'               => ['Z3_RESIDENTIAL_METRO', 11.9550, 8.5000],
        'mariri'              => ['Z3_RESIDENTIAL_METRO', 11.9400, 8.5650],
        'panshekara'          => ['Z3_RESIDENTIAL_METRO', 11.9350, 8.4800],
        'jaen'                => ['Z3_RESIDENTIAL_METRO', 11.9800, 8.4850],
        'bachirawa'           => ['Z3_RESIDENTIAL_METRO', 12.0250, 8.5050],
        'aminu-kano-airport'  => ['Z3_RESIDENTIAL_METRO', 12.0476, 8.5246],
        // Zone 4: outer ring & industrial
        'rijiyar-zaki'        => ['Z4_OUTER_RING', 11.9800, 8.4400],
        'kurna-rijiyar-lemo'  => ['Z4_OUTER_RING', 12.0300, 8.4950],
        'sharada-industrial'  => ['Z4_OUTER_RING', 11.9600, 8.4950],
        'dawanau-market'      => ['Z4_OUTER_RING', 12.0700, 8.4700],
        'unguwa-uku'          => ['Z4_OUTER_RING', 11.9500, 8.5300],
        'challawa'            => ['Z4_OUTER_RING', 11.9000, 8.4800],
        'kumbotso'            => ['Z4_OUTER_RING', 11.8900, 8.5050],
    ];

    public const ZONES = ['Z1_CENTRAL', 'Z2_COMMERCIAL_RESIDENTIAL', 'Z3_RESIDENTIAL_METRO', 'Z4_OUTER_RING'];
    public const SIZES = ['small', 'medium', 'large'];
    public const ROAD_FACTOR = 1.35;

    // Starting rates. Set your real ones in Station Ops → Pricing.
    public const DEFAULT_RATES = [
        'base'         => 800,   // ₦ flag-fall per job
        'perKm'        => 220,   // ₦ per road km
        'minimum'      => 1500,  // ₦ floor for any job
        'rounding'     => 100,   // ₦ round fees up to this step
        'sizeSmall'    => 0,     // envelope, phone, small pack
        'sizeMedium'   => 500,   // cake box, shoe box, small bag
        'sizeLarge'    => 1500,  // carton, bulk bag
        'fragile'      => 300,   // upright / careful handling
        'codPercent'   => 1.5,   // % of item price collected on delivery
        'codMinimum'   => 200,   // ₦ minimum CoD handling
    ];

    // Admin-editable bounds, so a typo cannot price a job at ₦0 or ₦1,000,000.
    private const RATE_BOUNDS = [
        'base' => [0, 20000], 'perKm' => [0, 5000], 'minimum' => [0, 50000], 'rounding' => [1, 1000],
        'sizeSmall' => [0, 20000], 'sizeMedium' => [0, 20000], 'sizeLarge' => [0, 50000], 'fragile' => [0, 20000],
        'codPercent' => [0, 20], 'codMinimum' => [0, 20000],
    ];

    public static function isLandmark(string $id): bool {
        return isset(self::LANDMARKS[$id]);
    }

    public static function zoneOf(string $id): ?string {
        return self::LANDMARKS[$id][0] ?? null;
    }

    public static function rates(PDO $db): array {
        static $cache = null;
        if ($cache === null) {
            $stmt = $db->prepare("SELECT v FROM settings WHERE k = 'pricing'");
            $stmt->execute();
            $saved = json_decode((string) $stmt->fetchColumn(), true);
            $cache = array_merge(self::DEFAULT_RATES, is_array($saved) ? array_intersect_key($saved, self::DEFAULT_RATES) : []);
        }
        return $cache;
    }

    public static function saveRates(PDO $db, array $input): array {
        $rates = self::DEFAULT_RATES;
        foreach (self::RATE_BOUNDS as $key => [$min, $max]) {
            $value = $input[$key] ?? self::rates($db)[$key];
            if (!is_numeric($value) || $value < $min || $value > $max) {
                throw new HttpException(422, "{$key} must be between {$min} and {$max}", ['field' => $key]);
            }
            $rates[$key] = $key === 'codPercent' ? round((float) $value, 2) : (int) round((float) $value);
        }
        $db->prepare("DELETE FROM settings WHERE k = 'pricing'")->execute();
        $db->prepare("INSERT INTO settings (k, v, updated_at) VALUES ('pricing', ?, ?)")->execute([json_encode($rates), Database::now()]);
        return $rates;
    }

    public static function roadKm(string $fromId, string $toId): float {
        [, $lat1, $lng1] = self::LANDMARKS[$fromId];
        [, $lat2, $lng2] = self::LANDMARKS[$toId];
        $r = 6371.0;
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        $a = sin($dLat / 2) ** 2 + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) ** 2;
        $straight = 2 * $r * asin(min(1, sqrt($a)));
        // floor(x + 0.5) rather than round(): identical results in PHP and JavaScript.
        return floor($straight * self::ROAD_FACTOR * 10 + 0.5) / 10;
    }

    public static function minutes(float $km): int {
        // Average ~21 km/h through Kano traffic, plus pickup handling.
        return (int) floor(8 + $km * 2.8 + 0.5);
    }

    public static function quote(array $rates, string $fromId, string $toId, string $size = 'small', bool $fragile = false, float $cod = 0.0): array {
        if (!self::isLandmark($fromId) || !self::isLandmark($toId)) {
            throw new HttpException(422, 'Unknown pickup or drop-off area');
        }
        if (!in_array($size, self::SIZES, true)) {
            throw new HttpException(422, 'Parcel size must be small, medium or large', ['field' => 'parcel_size']);
        }
        $km = self::roadKm($fromId, $toId);
        $distance = $rates['base'] + $rates['perKm'] * $km;
        $sizeFee = (float) $rates['size' . ucfirst($size)];
        $fragileFee = $fragile ? (float) $rates['fragile'] : 0.0;
        $codFee = $cod > 0 ? max((float) $rates['codMinimum'], $cod * $rates['codPercent'] / 100) : 0.0;

        $raw = max((float) $rates['minimum'], $distance + $sizeFee + $fragileFee + $codFee);
        $step = max(1, (int) $rates['rounding']);
        $fee = (float) (ceil((floor($raw * 100 + 0.5) / 100) / $step) * $step);

        return [
            'fee'       => $fee,
            'km'        => $km,
            'minutes'   => self::minutes($km),
            'breakdown' => [
                'distance' => round($distance),
                'size'     => round($sizeFee),
                'fragile'  => round($fragileFee),
                'cod'      => round($codFee),
                'minimum'  => (float) $rates['minimum'],
            ],
        ];
    }
}
