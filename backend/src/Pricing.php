<?php
// Fimrash Logistics Services - Authoritative Kano zone registry and fare calculator.
// Must stay in sync with frontend/src/data/kanoLandmarks.js; tests/fare_parity.php enforces it.

namespace Fimrash;

class Pricing {
    public const LANDMARK_ZONES = [
        'kwari-textiles' => 'Z1_CENTRAL', 'singer-market' => 'Z1_CENTRAL', 'sabon-gari' => 'Z1_CENTRAL',
        'kofar-wambai' => 'Z1_CENTRAL', 'bata-fagge' => 'Z1_CENTRAL',
        'gyadi-gyadi' => 'Z2_COMMERCIAL_RESIDENTIAL', 'farm-centre' => 'Z2_COMMERCIAL_RESIDENTIAL',
        'zoo-road' => 'Z2_COMMERCIAL_RESIDENTIAL', 'post-office-murtala' => 'Z2_COMMERCIAL_RESIDENTIAL',
        'naibawa' => 'Z3_RESIDENTIAL_METRO', 'nassarawa-gra' => 'Z3_RESIDENTIAL_METRO',
        'hotoro-gra' => 'Z3_RESIDENTIAL_METRO', 'tarauni-gra' => 'Z3_RESIDENTIAL_METRO',
        'janbulo-dorayi' => 'Z3_RESIDENTIAL_METRO', 'buk-new-campus' => 'Z3_RESIDENTIAL_METRO',
        'buk-old-campus' => 'Z3_RESIDENTIAL_METRO',
        'rijiyar-zaki' => 'Z4_OUTER_RING', 'kurna-rijiyar-lemo' => 'Z4_OUTER_RING',
        'sharada-industrial' => 'Z4_OUTER_RING', 'dawanau-market' => 'Z4_OUTER_RING',
        'unguwa-uku' => 'Z4_OUTER_RING',
    ];

    // Unordered neighbouring pairs billed at the flat neighbourhood rate.
    private const CLOSE_PAIRS = [
        ['gyadi-gyadi', 'naibawa'],
        ['tarauni-gra', 'hotoro-gra'],
        ['gyadi-gyadi', 'tarauni-gra'],
        ['farm-centre', 'gyadi-gyadi'],
    ];

    private const ZONE_WEIGHTS = [
        'Z1_CENTRAL' => 1.0,
        'Z2_COMMERCIAL_RESIDENTIAL' => 1.1,
        'Z3_RESIDENTIAL_METRO' => 1.3,
        'Z4_OUTER_RING' => 1.7,
    ];

    public static function isLandmark(string $id): bool {
        return isset(self::LANDMARK_ZONES[$id]);
    }

    public static function zoneOf(string $id): ?string {
        return self::LANDMARK_ZONES[$id] ?? null;
    }

    public static function fare(string $pickupId, string $dropoffId): float {
        if (!self::isLandmark($pickupId) || !self::isLandmark($dropoffId)) {
            throw new HttpException(422, 'Unknown pickup or drop-off landmark');
        }
        if ($pickupId === $dropoffId) {
            return 600.0;
        }
        foreach (self::CLOSE_PAIRS as [$a, $b]) {
            if (($pickupId === $a && $dropoffId === $b) || ($pickupId === $b && $dropoffId === $a)) {
                return 900.0;
            }
        }

        $z1 = self::LANDMARK_ZONES[$pickupId];
        $z2 = self::LANDMARK_ZONES[$dropoffId];
        if ($z1 === $z2) {
            return match ($z1) {
                'Z1_CENTRAL' => 800.0,
                'Z2_COMMERCIAL_RESIDENTIAL' => 900.0,
                'Z3_RESIDENTIAL_METRO' => 1000.0,
                default => 1200.0,
            };
        }

        $combined = (self::ZONE_WEIGHTS[$z1] + self::ZONE_WEIGHTS[$z2]) / 2;
        // JS Math.round rounds .5 up; PHP round() rounds half away from zero. Same for positives.
        $estimated = round((850 * $combined) / 50) * 50;
        return (float) max(800, min(2200, $estimated));
    }
}
