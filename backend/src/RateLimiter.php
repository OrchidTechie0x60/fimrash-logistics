<?php
// Fimrash Logistics Services - Fixed-window rate limiter stored in the database
// (shared hosting has no Redis/APCu guarantee, so the DB is the only shared store).
//
// hit()    counts every request and rejects once the window is full.
// check()  rejects if a bucket is full without counting (used before verifying a PIN).
// record() counts one event (used only when a PIN/password turns out to be wrong).
// clear()  empties a bucket (used after a successful sign-in).

namespace Fimrash;

use PDO;

class RateLimiter {
    public static function hit(PDO $db, string $bucket, int $limit, int $windowSeconds): void {
        self::check($db, $bucket, $limit, $windowSeconds);
        self::record($db, $bucket, $windowSeconds);
    }

    public static function check(PDO $db, string $bucket, int $limit, int $windowSeconds, ?string $message = null): void {
        $row = self::current($db, self::key($bucket), $windowSeconds);
        if ($row && (int) $row['hits'] >= $limit) {
            $retry = max(1, $windowSeconds - (time() - (int) $row['window_start']));
            header('Retry-After: ' . $retry);
            throw new HttpException(429, $message ?? self::waitMessage($retry), ['retryAfter' => $retry]);
        }
    }

    public static function record(PDO $db, string $bucket, int $windowSeconds): void {
        $key = self::key($bucket);
        $now = time();
        $db->beginTransaction();
        try {
            if (self::current($db, $key, $windowSeconds)) {
                $db->prepare('UPDATE rate_limits SET hits = hits + 1 WHERE bucket = ?')->execute([$key]);
            } else {
                $db->prepare('DELETE FROM rate_limits WHERE bucket = ?')->execute([$key]);
                $db->prepare('INSERT INTO rate_limits (bucket, hits, window_start) VALUES (?, 1, ?)')->execute([$key, $now]);
            }
            $db->commit();
        } catch (\Throwable $e) {
            if ($db->inTransaction()) {
                $db->rollBack();
            }
            throw $e;
        }
        self::maybeCleanup($db, $now);
    }

    public static function clear(PDO $db, string $bucket): void {
        $db->prepare('DELETE FROM rate_limits WHERE bucket = ?')->execute([self::key($bucket)]);
    }

    private static function current(PDO $db, string $key, int $windowSeconds): ?array {
        $stmt = $db->prepare('SELECT hits, window_start FROM rate_limits WHERE bucket = ?');
        $stmt->execute([$key]);
        $row = $stmt->fetch();
        if (!$row || (time() - (int) $row['window_start']) >= $windowSeconds) {
            return null;
        }
        return $row;
    }

    private static function key(string $bucket): string {
        return substr(hash('sha256', $bucket), 0, 64);
    }

    private static function waitMessage(int $retry): string {
        if ($retry >= 3600) {
            return 'Too many attempts. Please try again in ' . (int) ceil($retry / 3600) . ' hour(s).';
        }
        return 'Too many attempts. Please wait ' . (int) ceil($retry / 60) . ' minute(s) and try again.';
    }

    private static function maybeCleanup(PDO $db, int $now): void {
        if (random_int(1, 200) === 1) {
            $db->prepare('DELETE FROM rate_limits WHERE window_start < ?')->execute([$now - 172800]);
        }
    }
}
