<?php
// Fimrash Logistics Services - Fixed-window rate limiter stored in the database
// (shared hosting has no Redis/APCu guarantee, so the DB is the only shared store).

namespace Fimrash;

use PDO;

class RateLimiter {
    public static function hit(PDO $db, string $bucket, int $limit, int $windowSeconds): void {
        $key = substr(hash('sha256', $bucket), 0, 64);
        $now = time();

        $db->beginTransaction();
        try {
            $stmt = $db->prepare('SELECT hits, window_start FROM rate_limits WHERE bucket = ?');
            $stmt->execute([$key]);
            $row = $stmt->fetch();

            if (!$row || ($now - (int) $row['window_start']) >= $windowSeconds) {
                $db->prepare('DELETE FROM rate_limits WHERE bucket = ?')->execute([$key]);
                $db->prepare('INSERT INTO rate_limits (bucket, hits, window_start) VALUES (?, 1, ?)')->execute([$key, $now]);
                $db->commit();
                self::maybeCleanup($db, $now);
                return;
            }

            if ((int) $row['hits'] >= $limit) {
                $db->commit();
                $retry = $windowSeconds - ($now - (int) $row['window_start']);
                header('Retry-After: ' . max(1, $retry));
                throw new HttpException(429, 'Too many attempts. Please wait ' . max(1, (int) ceil($retry / 60)) . ' minute(s) and try again.');
            }

            $db->prepare('UPDATE rate_limits SET hits = hits + 1 WHERE bucket = ?')->execute([$key]);
            $db->commit();
        } catch (HttpException $e) {
            throw $e;
        } catch (\Throwable $e) {
            if ($db->inTransaction()) {
                $db->rollBack();
            }
            throw $e;
        }
    }

    private static function maybeCleanup(PDO $db, int $now): void {
        if (random_int(1, 200) === 1) {
            $db->prepare('DELETE FROM rate_limits WHERE window_start < ?')->execute([$now - 86400]);
        }
    }
}
