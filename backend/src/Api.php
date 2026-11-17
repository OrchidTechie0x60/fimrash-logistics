<?php
// Fimrash Logistics Services - API handlers
//
// Roles:   public (customers, no account) · rider · admin
// Lifecycle: pending → assigned → picked_up → in_transit → arrived → delivered
//            (cancelled from any state before delivered; delivered only via OTP handshake)

namespace Fimrash;

use PDO;

class Api {
    private const OTP_MAX_ATTEMPTS = 5;
    private const ACTIVE_STATUSES = ['assigned', 'picked_up', 'in_transit', 'arrived'];
    private const RIDER_TRANSITIONS = [
        'assigned'   => ['picked_up'],
        'picked_up'  => ['in_transit', 'arrived'],
        'in_transit' => ['arrived'],
    ];
    // Excludes 0/O and 1/I/L so codes survive being read aloud over the phone.
    private const CODE_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

    public function __construct(private PDO $db) {}

    // ═════════════════════════════════════════════════════════════
    // Public
    // ═════════════════════════════════════════════════════════════

    public function health(): void {
        $this->db->query('SELECT 1');
        Http::json([
            'status'  => 'healthy',
            'service' => 'Fimrash Logistics API',
            'version' => '3.0.0',
            'time'    => gmdate('c'),
        ]);
    }

    public function quote(): void {
        $input = Http::input();
        $pickup = (string) ($input['pickup_landmark_id'] ?? '');
        $dropoff = (string) ($input['dropoff_landmark_id'] ?? '');
        Http::json(['deliveryFee' => Pricing::fare($pickup, $dropoff)]);
    }

    public function createDelivery(): void {
        RateLimiter::hit($this->db, 'create:' . Http::clientIp(), 30, 3600);
        $in = Http::input();

        $senderLandmark = (string) ($in['sender_landmark_id'] ?? '');
        $recipientLandmark = (string) ($in['recipient_landmark_id'] ?? '');
        if (!Pricing::isLandmark($senderLandmark)) {
            throw new HttpException(422, 'Choose a valid pickup landmark', ['field' => 'sender_landmark_id']);
        }
        if (!Pricing::isLandmark($recipientLandmark)) {
            throw new HttpException(422, 'Choose a valid drop-off landmark', ['field' => 'recipient_landmark_id']);
        }

        $paymentMode = Http::oneOf($in, 'payment_mode', ['pay_on_delivery', 'prepaid'], 'pay_on_delivery');
        $data = [
            'sender_type'               => Http::oneOf($in, 'sender_type', ['home', 'market', 'office'], 'home'),
            'sender_name'               => Http::text($in, 'sender_name', 128, true, 'Sender name'),
            'sender_phone'              => Http::phone($in, 'sender_phone', 'Sender phone'),
            'sender_landmark_id'        => $senderLandmark,
            'sender_landmark_detail'    => Http::text($in, 'sender_landmark_detail', 255, true, 'Pickup address'),
            'recipient_type'            => Http::oneOf($in, 'recipient_type', ['home', 'market', 'office'], 'home'),
            'recipient_name'            => Http::text($in, 'recipient_name', 128, true, 'Recipient name'),
            'recipient_phone'           => Http::phone($in, 'recipient_phone', 'Recipient phone'),
            'recipient_landmark_id'     => $recipientLandmark,
            'recipient_landmark_detail' => Http::text($in, 'recipient_landmark_detail', 255, true, 'Delivery address'),
            'item_category'             => Http::text($in, 'item_category', 64, true, 'Item category'),
            'item_description'          => Http::text($in, 'item_description', 255, true, 'Parcel description'),
            'is_fragile'                => !empty($in['is_fragile']) ? 1 : 0,
            'special_instructions'      => Http::text($in, 'special_instructions', 255, false),
            'payment_mode'              => $paymentMode,
            'cod_amount'                => Http::money($in, 'cod_amount', 5_000_000),
            // Never trust a client-supplied fee.
            'delivery_fee'              => Pricing::fare($senderLandmark, $recipientLandmark),
        ];

        $id = Database::newId('del');
        $otp = $this->newOtp();
        $now = Database::now();
        $rider = $this->pickRider($senderLandmark);

        $data += [
            'id'                => $id,
            'tracking_code'     => $this->newTrackingCode(),
            'otp_code'          => '',
            'otp_hash'          => $this->otpHash($id, $otp),
            'assigned_rider_id' => $rider['id'] ?? null,
            'status'            => $rider ? 'assigned' : 'pending',
            'created_at'        => $now,
            'updated_at'        => $now,
        ];

        $this->db->beginTransaction();
        try {
            $columns = array_keys($data);
            $sql = 'INSERT INTO deliveries (' . implode(', ', $columns) . ') VALUES (' . implode(', ', array_fill(0, count($columns), '?')) . ')';
            $this->db->prepare($sql)->execute(array_values($data));
            $this->logEvent($id, 'pending', 'public', null, 'Booking created');
            if ($rider) {
                $this->logEvent($id, 'assigned', 'system', null, 'Auto-assigned to ' . $rider['name']);
            }
            $this->db->commit();
        } catch (\Throwable $e) {
            $this->db->rollBack();
            throw $e;
        }

        $smsSent = $this->sendOtpSms($data['recipient_phone'], $data['tracking_code'], $data['sender_name'], $otp);

        $delivery = $this->formatFull($this->findDelivery($id));
        $delivery['otp'] = $otp; // shown once, to the sender only
        Http::json(['delivery' => $delivery, 'smsSent' => $smsSent], 201);
    }

    public function track(string $code): void {
        RateLimiter::hit($this->db, 'track:' . Http::clientIp(), 120, 600);
        $code = strtoupper(trim($code));
        $stmt = $this->db->prepare('SELECT * FROM deliveries WHERE tracking_code = ?');
        $stmt->execute([$code]);
        $row = $stmt->fetch();
        if (!$row) {
            throw new HttpException(404, 'No consignment found with that tracking code');
        }
        Http::json(['delivery' => $this->formatPublic($row)]);
    }

    // ═════════════════════════════════════════════════════════════
    // Auth
    // ═════════════════════════════════════════════════════════════

    public function login(): void {
        $in = Http::input();
        $role = Http::oneOf($in, 'role', ['rider', 'admin']);
        $identifier = trim((string) ($in['identifier'] ?? ''));
        $secret = (string) ($in['secret'] ?? '');
        if ($identifier === '' || $secret === '') {
            throw new HttpException(422, 'Enter your sign-in ID and PIN/password');
        }

        RateLimiter::hit($this->db, 'login-ip:' . Http::clientIp(), 30, 900);
        RateLimiter::hit($this->db, 'login-id:' . $role . ':' . strtolower($identifier), 8, 900);

        if ($role === 'rider') {
            $phone = Http::normalisePhone($identifier) ?? '__none__';
            $stmt = $this->db->prepare('SELECT * FROM riders WHERE active = 1 AND pin_hash IS NOT NULL AND (phone = ? OR LOWER(bike_number) = LOWER(?) OR LOWER(id) = LOWER(?)) LIMIT 1');
            $stmt->execute([$phone, $identifier, $identifier]);
            $hashField = 'pin_hash';
            $ttl = Auth::RIDER_TOKEN_TTL;
        } else {
            $this->ensureBootstrapAdmin();
            $stmt = $this->db->prepare('SELECT * FROM admin_users WHERE active = 1 AND email = ? LIMIT 1');
            $stmt->execute([strtolower($identifier)]);
            $hashField = 'password_hash';
            $ttl = Auth::ADMIN_TOKEN_TTL;
        }
        $account = $stmt->fetch();

        // Verify against a dummy hash when the account is missing so timing doesn't reveal valid IDs.
        $hash = $account[$hashField] ?? password_hash('fimrash-timing-dummy', PASSWORD_DEFAULT);
        if (!password_verify($secret, $hash) || !$account) {
            throw new HttpException(401, $role === 'rider' ? 'Wrong rider ID or PIN' : 'Wrong email or password');
        }

        if (password_needs_rehash($hash, PASSWORD_DEFAULT)) {
            $table = $role === 'rider' ? 'riders' : 'admin_users';
            $this->db->prepare("UPDATE {$table} SET {$hashField} = ? WHERE id = ?")->execute([Auth::hashSecret($secret), $account['id']]);
        }

        $account['role'] = $role;
        Http::json([
            'token' => Auth::issueToken($role, $account['id'], $ttl),
            'user'  => Auth::publicUser($account),
        ]);
    }

    public function me(): void {
        $user = Auth::require($this->db, ['rider', 'admin']);
        Http::json(['user' => Auth::publicUser($user)]);
    }

    public function changeSecret(): void {
        $user = Auth::require($this->db, ['rider', 'admin']);
        $in = Http::input();
        $current = (string) ($in['current'] ?? '');
        $new = (string) ($in['new'] ?? '');
        RateLimiter::hit($this->db, 'change-secret:' . $user['id'], 5, 900);

        $table = $user['role'] === 'rider' ? 'riders' : 'admin_users';
        $field = $user['role'] === 'rider' ? 'pin_hash' : 'password_hash';
        $stmt = $this->db->prepare("SELECT {$field} FROM {$table} WHERE id = ?");
        $stmt->execute([$user['id']]);
        if (!password_verify($current, (string) $stmt->fetchColumn())) {
            throw new HttpException(401, 'Current PIN/password is incorrect');
        }
        $user['role'] === 'rider' ? Auth::validatePin($new) : Auth::validatePassword($new);
        $this->db->prepare("UPDATE {$table} SET {$field} = ? WHERE id = ?")->execute([Auth::hashSecret($new), $user['id']]);
        Http::json(['success' => true]);
    }

    private function ensureBootstrapAdmin(): void {
        if ((int) $this->db->query('SELECT COUNT(*) FROM admin_users')->fetchColumn() > 0) {
            return;
        }
        $boot = Config::get('bootstrap_admin', []);
        $email = strtolower(trim((string) ($boot['email'] ?? '')));
        $password = (string) ($boot['password'] ?? '');
        if ($email === '' || strlen($password) < 10) {
            return;
        }
        $this->db->prepare('INSERT INTO admin_users (id, email, name, password_hash, active, created_at) VALUES (?, ?, ?, ?, 1, ?)')
            ->execute([Database::newId('adm'), $email, $boot['name'] ?? 'Station Controller', Auth::hashSecret($password), Database::now()]);
    }

    // ═════════════════════════════════════════════════════════════
    // Deliveries (rider + admin)
    // ═════════════════════════════════════════════════════════════

    public function listDeliveries(): void {
        $user = Auth::require($this->db, ['rider', 'admin']);

        if ($user['role'] === 'rider') {
            $stmt = $this->db->prepare("
                SELECT d.*, r.name AS rider_name, r.phone AS rider_phone, r.bike_number AS rider_bike_number
                FROM deliveries d LEFT JOIN riders r ON r.id = d.assigned_rider_id
                WHERE d.assigned_rider_id = ?
                  AND (d.status IN ('assigned', 'picked_up', 'in_transit', 'arrived') OR d.updated_at >= ?)
                ORDER BY d.created_at ASC
            ");
            $stmt->execute([$user['id'], $this->startOfTodayUtc()]);
            Http::json([
                'deliveries' => array_map(fn ($r) => $this->formatFull($r), $stmt->fetchAll()),
                'cashHeld'   => $this->riderCashHeld($user['id']),
            ]);
        }

        $where = [];
        $params = [];
        $status = (string) ($_GET['status'] ?? '');
        if ($status === 'active') {
            $where[] = "d.status IN ('pending', 'assigned', 'picked_up', 'in_transit', 'arrived')";
        } elseif ($status === 'cod_pending') {
            $where[] = "d.cod_payout_status = 'pending'";
        } elseif ($status !== '') {
            $where[] = 'd.status = ?';
            $params[] = $status;
        }
        $q = trim((string) ($_GET['q'] ?? ''));
        if ($q !== '') {
            $where[] = '(d.tracking_code LIKE ? OR d.sender_phone LIKE ? OR d.recipient_phone LIKE ? OR d.sender_name LIKE ? OR d.recipient_name LIKE ?)';
            // Wildcards are stripped rather than escaped: SQLite and MySQL disagree on LIKE escaping.
            $like = '%' . str_replace(['%', '_', '\\'], '', $q) . '%';
            array_push($params, $like, $like, $like, $like, $like);
        }
        $sql = '
            SELECT d.*, r.name AS rider_name, r.phone AS rider_phone, r.bike_number AS rider_bike_number
            FROM deliveries d LEFT JOIN riders r ON r.id = d.assigned_rider_id'
            . ($where ? ' WHERE ' . implode(' AND ', $where) : '')
            . ' ORDER BY d.created_at DESC LIMIT 300';
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        Http::json(['deliveries' => array_map(fn ($r) => $this->formatFull($r), $stmt->fetchAll())]);
    }

    public function getDelivery(string $id): void {
        $user = Auth::require($this->db, ['rider', 'admin']);
        $row = $this->findDelivery($id);
        if ($user['role'] === 'rider' && $row['assigned_rider_id'] !== $user['id']) {
            throw new HttpException(404, 'Delivery not found');
        }
        $delivery = $this->formatFull($row);
        $delivery['timeline'] = $this->timeline($id, true);
        Http::json(['delivery' => $delivery]);
    }

    public function updateStatus(string $id): void {
        $rider = Auth::require($this->db, ['rider']);
        $next = (string) (Http::input()['status'] ?? '');
        $row = $this->findDelivery($id);

        if ($row['assigned_rider_id'] !== $rider['id']) {
            throw new HttpException(404, 'Delivery not found');
        }
        if (!in_array($next, self::RIDER_TRANSITIONS[$row['status']] ?? [], true)) {
            throw new HttpException(409, "Cannot move a delivery from '{$row['status']}' to '{$next}'", ['status' => $row['status']]);
        }

        $stmt = $this->db->prepare('UPDATE deliveries SET status = ?, updated_at = ? WHERE id = ? AND status = ? AND assigned_rider_id = ?');
        $stmt->execute([$next, Database::now(), $id, $row['status'], $rider['id']]);
        if ($stmt->rowCount() !== 1) {
            throw new HttpException(409, 'This delivery was updated by someone else. Refresh and try again.');
        }
        $this->logEvent($id, $next, 'rider', $rider['id']);
        Http::json(['delivery' => $this->formatFull($this->findDelivery($id))]);
    }

    public function verifyOtp(string $id): void {
        $rider = Auth::require($this->db, ['rider']);
        RateLimiter::hit($this->db, 'otp:' . $rider['id'], 30, 600);
        $otp = preg_replace('/\D/', '', (string) (Http::input()['otp'] ?? ''));
        $row = $this->findDelivery($id);

        if ($row['assigned_rider_id'] !== $rider['id']) {
            throw new HttpException(404, 'Delivery not found');
        }
        if ($row['status'] === 'delivered') {
            throw new HttpException(409, 'This delivery is already completed');
        }
        if (!in_array($row['status'], ['picked_up', 'in_transit', 'arrived'], true)) {
            throw new HttpException(409, 'Mark the parcel as picked up before completing the handover');
        }
        if ((int) $row['otp_locked'] === 1) {
            throw new HttpException(423, 'Too many wrong codes. This delivery is locked — call the dispatch desk to unlock it.');
        }

        if (!$row['otp_hash'] || !hash_equals($row['otp_hash'], $this->otpHash($id, $otp))) {
            $attempts = (int) $row['otp_attempts'] + 1;
            $locked = $attempts >= self::OTP_MAX_ATTEMPTS ? 1 : 0;
            $this->db->prepare('UPDATE deliveries SET otp_attempts = ?, otp_locked = ?, updated_at = ? WHERE id = ?')
                ->execute([$attempts, $locked, Database::now(), $id]);
            $this->logEvent($id, $locked ? 'otp_locked' : 'otp_failed', 'rider', $rider['id'], "Wrong code (attempt {$attempts})");
            throw new HttpException(422, 'Lambar sirri ba daidai ba — wrong handover code.', [
                'attemptsRemaining' => max(0, self::OTP_MAX_ATTEMPTS - $attempts),
                'locked'            => (bool) $locked,
            ]);
        }

        $fee = (float) $row['delivery_fee'];
        $cod = (float) $row['cod_amount'];
        $feeCash = $row['payment_mode'] === 'pay_on_delivery' ? $fee : 0.0;
        $totalCash = $feeCash + $cod;
        $now = Database::now();

        $this->db->beginTransaction();
        try {
            // Conditional update makes completion idempotent: a replayed request changes nothing.
            $stmt = $this->db->prepare("
                UPDATE deliveries
                SET status = 'delivered', otp_verified_at = ?, cod_collected_by_rider = ?,
                    cod_payout_status = ?, updated_at = ?
                WHERE id = ? AND assigned_rider_id = ? AND status IN ('picked_up', 'in_transit', 'arrived')
            ");
            $stmt->execute([$now, $totalCash > 0 ? 1 : 0, $cod > 0 ? 'pending' : 'none', $now, $id, $rider['id']]);
            if ($stmt->rowCount() !== 1) {
                throw new HttpException(409, 'This delivery is already completed');
            }
            if ($totalCash > 0) {
                $this->db->prepare("INSERT INTO cash_collections (id, delivery_id, rider_id, fee_cash, cod_cash, total_cash, status, collected_at) VALUES (?, ?, ?, ?, ?, ?, 'held', ?)")
                    ->execute([Database::newId('cash'), $id, $rider['id'], $feeCash, $cod, $totalCash, $now]);
            }
            $this->logEvent($id, 'delivered', 'rider', $rider['id'], $totalCash > 0 ? 'Collected ₦' . number_format($totalCash) . ' cash' : null);
            $this->db->commit();
        } catch (\Throwable $e) {
            $this->db->rollBack();
            throw $e;
        }

        Http::json([
            'delivery'      => $this->formatFull($this->findDelivery($id)),
            'cashCollected' => $totalCash,
            'cashHeld'      => $this->riderCashHeld($rider['id']),
        ]);
    }

    public function setAvailability(): void {
        $rider = Auth::require($this->db, ['rider']);
        $status = Http::oneOf(Http::input(), 'status', ['available', 'off_duty']);
        $this->db->prepare('UPDATE riders SET status = ? WHERE id = ?')->execute([$status, $rider['id']]);
        $rider['status'] = $status;
        Http::json(['user' => Auth::publicUser($rider)]);
    }

    // ═════════════════════════════════════════════════════════════
    // Admin operations
    // ═════════════════════════════════════════════════════════════

    public function assign(string $id): void {
        $admin = Auth::require($this->db, ['admin']);
        $riderId = (string) (Http::input()['rider_id'] ?? '');
        $row = $this->findDelivery($id);
        if (!in_array($row['status'], ['pending', 'assigned'], true)) {
            throw new HttpException(409, 'Only deliveries that have not been picked up can be (re)assigned');
        }
        $stmt = $this->db->prepare('SELECT id, name FROM riders WHERE id = ? AND active = 1');
        $stmt->execute([$riderId]);
        $rider = $stmt->fetch();
        if (!$rider) {
            throw new HttpException(422, 'Choose an active rider');
        }

        $stmt = $this->db->prepare("UPDATE deliveries SET assigned_rider_id = ?, status = 'assigned', updated_at = ? WHERE id = ? AND status IN ('pending', 'assigned')");
        $stmt->execute([$rider['id'], Database::now(), $id]);
        if ($stmt->rowCount() !== 1) {
            throw new HttpException(409, 'Delivery changed while assigning. Refresh and try again.');
        }
        $this->logEvent($id, 'assigned', 'admin', $admin['id'], 'Assigned to ' . $rider['name']);
        Http::json(['delivery' => $this->formatFull($this->findDelivery($id))]);
    }

    public function cancel(string $id): void {
        $admin = Auth::require($this->db, ['admin']);
        $reason = Http::text(Http::input(), 'reason', 255, true, 'Cancellation reason');
        $stmt = $this->db->prepare("UPDATE deliveries SET status = 'cancelled', cancel_reason = ?, updated_at = ? WHERE id = ? AND status NOT IN ('delivered', 'cancelled')");
        $stmt->execute([$reason, Database::now(), $id]);
        if ($stmt->rowCount() !== 1) {
            $this->findDelivery($id); // 404 if missing
            throw new HttpException(409, 'Delivered or already-cancelled deliveries cannot be cancelled');
        }
        $this->logEvent($id, 'cancelled', 'admin', $admin['id'], $reason);
        Http::json(['delivery' => $this->formatFull($this->findDelivery($id))]);
    }

    // Issues a fresh code (e.g. the sender lost it, or the delivery was locked after wrong guesses).
    public function resetOtp(string $id): void {
        $admin = Auth::require($this->db, ['admin']);
        $row = $this->findDelivery($id);
        if (in_array($row['status'], ['delivered', 'cancelled'], true)) {
            throw new HttpException(409, 'This delivery is closed');
        }
        $otp = $this->newOtp();
        $this->db->prepare('UPDATE deliveries SET otp_hash = ?, otp_attempts = 0, otp_locked = 0, updated_at = ? WHERE id = ?')
            ->execute([$this->otpHash($id, $otp), Database::now(), $id]);
        $this->logEvent($id, 'otp_reset', 'admin', $admin['id'], 'New handover code issued');
        $smsSent = $this->sendOtpSms($row['recipient_phone'], $row['tracking_code'], $row['sender_name'], $otp);
        Http::json(['otp' => $otp, 'smsSent' => $smsSent, 'delivery' => $this->formatFull($this->findDelivery($id))]);
    }

    public function codPayout(string $id): void {
        $admin = Auth::require($this->db, ['admin']);
        $reference = Http::text(Http::input(), 'reference', 128, true, 'Payment reference');
        $now = Database::now();
        $stmt = $this->db->prepare("UPDATE deliveries SET cod_payout_status = 'paid', cod_paid_at = ?, cod_payout_reference = ?, cod_paid_by = ?, updated_at = ? WHERE id = ? AND status = 'delivered' AND cod_payout_status = 'pending'");
        $stmt->execute([$now, $reference, $admin['id'], $now, $id]);
        if ($stmt->rowCount() !== 1) {
            $this->findDelivery($id);
            throw new HttpException(409, 'Only delivered CoD orders awaiting payout can be marked paid');
        }
        $this->logEvent($id, 'cod_paid', 'admin', $admin['id'], 'Vendor paid, ref ' . $reference);
        Http::json(['delivery' => $this->formatFull($this->findDelivery($id))]);
    }

    public function listRiders(): void {
        Auth::require($this->db, ['admin']);
        $rows = $this->db->query("
            SELECT r.id, r.name, r.phone, r.bike_number, r.active_zone, r.status, r.active,
                   CASE WHEN r.pin_hash IS NULL THEN 0 ELSE 1 END AS has_pin,
                   (SELECT COUNT(*) FROM deliveries d WHERE d.assigned_rider_id = r.id AND d.status IN ('assigned', 'picked_up', 'in_transit', 'arrived')) AS active_jobs,
                   (SELECT COALESCE(SUM(c.total_cash), 0) FROM cash_collections c WHERE c.rider_id = r.id AND c.status = 'held') AS cash_held
            FROM riders r ORDER BY r.active DESC, r.name ASC
        ")->fetchAll();
        Http::json(['riders' => array_map(fn ($r) => $this->formatRider($r), $rows)]);
    }

    public function saveRider(?string $id): void {
        Auth::require($this->db, ['admin']);
        $in = Http::input();
        $existing = null;
        if ($id !== null) {
            $stmt = $this->db->prepare('SELECT * FROM riders WHERE id = ?');
            $stmt->execute([$id]);
            $existing = $stmt->fetch();
            if (!$existing) {
                throw new HttpException(404, 'Rider not found');
            }
        }

        $fields = [
            'name'        => Http::text($in + ['name' => $existing['name'] ?? ''], 'name', 128, true, 'Rider name'),
            'phone'       => Http::phone($in + ['phone' => $existing['phone'] ?? ''], 'phone', 'Rider phone'),
            'bike_number' => strtoupper(Http::text($in + ['bike_number' => $existing['bike_number'] ?? ''], 'bike_number', 32, true, 'Bike plate number')),
            'active_zone' => Http::oneOf($in, 'active_zone', array_values(array_unique(Pricing::LANDMARK_ZONES)), $existing['active_zone'] ?? 'Z1_CENTRAL'),
            'active'      => array_key_exists('active', $in) ? (!empty($in['active']) ? 1 : 0) : (int) ($existing['active'] ?? 1),
        ];

        $dupe = $this->db->prepare('SELECT id FROM riders WHERE (phone = ? OR UPPER(bike_number) = ?) AND id <> ?');
        $dupe->execute([$fields['phone'], $fields['bike_number'], $id ?? '']);
        if ($dupe->fetch()) {
            throw new HttpException(422, 'Another rider already uses this phone number or bike plate');
        }

        $pin = (string) ($in['pin'] ?? '');
        if ($pin !== '') {
            Auth::validatePin($pin);
            $fields['pin_hash'] = Auth::hashSecret($pin);
        } elseif ($existing === null || $existing['pin_hash'] === null) {
            if ($fields['active']) {
                throw new HttpException(422, 'Set a PIN so the rider can sign in', ['field' => 'pin']);
            }
        }

        if ($existing) {
            $sets = implode(', ', array_map(fn ($c) => "{$c} = ?", array_keys($fields)));
            $this->db->prepare("UPDATE riders SET {$sets} WHERE id = ?")->execute([...array_values($fields), $id]);
        } else {
            $id = 'rdr_' . bin2hex(random_bytes(4));
            $fields += ['id' => $id, 'status' => 'available', 'cash_in_hand' => 0, 'created_at' => Database::now()];
            $cols = array_keys($fields);
            $this->db->prepare('INSERT INTO riders (' . implode(', ', $cols) . ') VALUES (' . implode(', ', array_fill(0, count($cols), '?')) . ')')
                ->execute(array_values($fields));
        }

        $stmt = $this->db->prepare("
            SELECT r.*, CASE WHEN r.pin_hash IS NULL THEN 0 ELSE 1 END AS has_pin,
                   (SELECT COUNT(*) FROM deliveries d WHERE d.assigned_rider_id = r.id AND d.status IN ('assigned', 'picked_up', 'in_transit', 'arrived')) AS active_jobs,
                   (SELECT COALESCE(SUM(c.total_cash), 0) FROM cash_collections c WHERE c.rider_id = r.id AND c.status = 'held') AS cash_held
            FROM riders r WHERE r.id = ?
        ");
        $stmt->execute([$id]);
        Http::json(['rider' => $this->formatRider($stmt->fetch())], $existing ? 200 : 201);
    }

    // Station receives a rider's physical cash pouch. Records what was expected vs. counted.
    public function remit(string $riderId): void {
        $admin = Auth::require($this->db, ['admin']);
        $in = Http::input();
        $received = Http::money($in, 'received_amount', 50_000_000);
        $note = Http::text($in, 'note', 255, false);
        $now = Database::now();
        $remittanceId = Database::newId('rem');

        $this->db->beginTransaction();
        try {
            $stmt = $this->db->prepare("SELECT id, total_cash FROM cash_collections WHERE rider_id = ? AND status = 'held'");
            $stmt->execute([$riderId]);
            $held = $stmt->fetchAll();
            if (!$held) {
                throw new HttpException(409, 'This rider has no cash to remit');
            }
            $expected = array_sum(array_map(fn ($r) => (float) $r['total_cash'], $held));
            $ids = array_column($held, 'id');

            $marks = implode(', ', array_fill(0, count($ids), '?'));
            $update = $this->db->prepare("UPDATE cash_collections SET status = 'remitted', remittance_id = ?, remitted_at = ? WHERE status = 'held' AND id IN ({$marks})");
            $update->execute([$remittanceId, $now, ...$ids]);
            if ($update->rowCount() !== count($ids)) {
                throw new HttpException(409, 'Cash records changed during remittance. Refresh and try again.');
            }

            $this->db->prepare('INSERT INTO remittances (id, rider_id, expected_amount, received_amount, admin_id, note, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
                ->execute([$remittanceId, $riderId, $expected, $received, $admin['id'], $note ?: null, $now]);
            $this->db->commit();
        } catch (\Throwable $e) {
            $this->db->rollBack();
            throw $e;
        }

        Http::json(['remittance' => [
            'id'        => $remittanceId,
            'riderId'   => $riderId,
            'expected'  => $expected,
            'received'  => $received,
            'shortfall' => round($expected - $received, 2),
            'createdAt' => $this->iso($now),
        ]]);
    }

    public function reconciliation(): void {
        Auth::require($this->db, ['admin']);
        $today = $this->startOfTodayUtc();

        $totals = $this->db->prepare("
            SELECT
                COUNT(*) AS total,
                SUM(CASE WHEN status IN ('pending', 'assigned', 'picked_up', 'in_transit', 'arrived') THEN 1 ELSE 0 END) AS active,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS unassigned,
                SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) AS delivered,
                SUM(CASE WHEN status = 'delivered' AND otp_verified_at >= ? THEN 1 ELSE 0 END) AS delivered_today,
                SUM(CASE WHEN status = 'delivered' THEN delivery_fee ELSE 0 END) AS revenue,
                SUM(CASE WHEN status = 'delivered' AND otp_verified_at >= ? THEN delivery_fee ELSE 0 END) AS revenue_today,
                SUM(CASE WHEN cod_payout_status = 'pending' THEN cod_amount ELSE 0 END) AS cod_pending,
                SUM(CASE WHEN cod_payout_status = 'paid' THEN cod_amount ELSE 0 END) AS cod_paid,
                SUM(CASE WHEN otp_locked = 1 AND status NOT IN ('delivered', 'cancelled') THEN 1 ELSE 0 END) AS locked
            FROM deliveries
        ");
        $totals->execute([$today, $today]);
        $t = $totals->fetch();

        $cashHeld = (float) $this->db->query("SELECT COALESCE(SUM(total_cash), 0) FROM cash_collections WHERE status = 'held'")->fetchColumn();

        $remittances = $this->db->query("
            SELECT m.*, r.name AS rider_name FROM remittances m LEFT JOIN riders r ON r.id = m.rider_id
            ORDER BY m.created_at DESC LIMIT 20
        ")->fetchAll();

        Http::json([
            'summary' => [
                'totalDeliveries'   => (int) $t['total'],
                'activeDeliveries'  => (int) $t['active'],
                'unassigned'        => (int) $t['unassigned'],
                'delivered'         => (int) $t['delivered'],
                'deliveredToday'    => (int) $t['delivered_today'],
                'revenue'           => (float) $t['revenue'],
                'revenueToday'      => (float) $t['revenue_today'],
                'cashHeldByRiders'  => $cashHeld,
                'codPendingPayout'  => (float) $t['cod_pending'],
                'codPaidOut'        => (float) $t['cod_paid'],
                'lockedDeliveries'  => (int) $t['locked'],
            ],
            'remittances' => array_map(fn ($m) => [
                'id'        => $m['id'],
                'riderId'   => $m['rider_id'],
                'riderName' => $m['rider_name'],
                'expected'  => (float) $m['expected_amount'],
                'received'  => (float) $m['received_amount'],
                'shortfall' => round((float) $m['expected_amount'] - (float) $m['received_amount'], 2),
                'note'      => $m['note'],
                'createdAt' => $this->iso($m['created_at']),
            ], $remittances),
        ]);
    }

    // ═════════════════════════════════════════════════════════════
    // Helpers
    // ═════════════════════════════════════════════════════════════

    private function findDelivery(string $id): array {
        $stmt = $this->db->prepare('
            SELECT d.*, r.name AS rider_name, r.phone AS rider_phone, r.bike_number AS rider_bike_number
            FROM deliveries d LEFT JOIN riders r ON r.id = d.assigned_rider_id
            WHERE d.id = ?
        ');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) {
            throw new HttpException(404, 'Delivery not found');
        }
        return $row;
    }

    private function pickRider(string $pickupLandmarkId): ?array {
        // Prefer an on-duty rider in the pickup zone, then the least-loaded rider anywhere.
        $stmt = $this->db->prepare("
            SELECT r.id, r.name,
                   (SELECT COUNT(*) FROM deliveries d WHERE d.assigned_rider_id = r.id AND d.status IN ('assigned', 'picked_up', 'in_transit', 'arrived')) AS active_jobs
            FROM riders r
            WHERE r.active = 1 AND r.status = 'available' AND r.pin_hash IS NOT NULL
            ORDER BY CASE WHEN r.active_zone = ? THEN 0 ELSE 1 END, active_jobs ASC, r.id ASC
            LIMIT 1
        ");
        $stmt->execute([Pricing::zoneOf($pickupLandmarkId)]);
        return $stmt->fetch() ?: null;
    }

    private function riderCashHeld(string $riderId): float {
        $stmt = $this->db->prepare("SELECT COALESCE(SUM(total_cash), 0) FROM cash_collections WHERE rider_id = ? AND status = 'held'");
        $stmt->execute([$riderId]);
        return (float) $stmt->fetchColumn();
    }

    private function newOtp(): string {
        return str_pad((string) random_int(0, 9999), 4, '0', STR_PAD_LEFT);
    }

    private function otpHash(string $deliveryId, string $otp): string {
        return hash_hmac('sha256', $deliveryId . ':' . $otp, Config::appSecret());
    }

    private function newTrackingCode(): string {
        $stmt = $this->db->prepare('SELECT 1 FROM deliveries WHERE tracking_code = ?');
        for ($i = 0; $i < 10; $i++) {
            $suffix = '';
            for ($c = 0; $c < 6; $c++) {
                $suffix .= self::CODE_ALPHABET[random_int(0, strlen(self::CODE_ALPHABET) - 1)];
            }
            $code = 'FMR-KN-' . $suffix;
            $stmt->execute([$code]);
            if (!$stmt->fetch()) {
                return $code;
            }
        }
        throw new \RuntimeException('Could not allocate a unique tracking code');
    }

    private function sendOtpSms(string $phone, string $trackingCode, string $senderName, string $otp): bool {
        if (!Sms::isEnabled()) {
            return false;
        }
        $url = rtrim((string) Config::get('public_app_url', ''), '/');
        $link = $url ? " Track: {$url}/track/{$trackingCode}" : '';
        $sender = mb_substr($senderName, 0, 30);
        return Sms::send($phone, "Fimrash: parcel {$trackingCode} from {$sender} is on its way. Handover code: {$otp}. Give it to the rider ONLY after you receive your parcel.{$link}");
    }

    private function logEvent(string $deliveryId, string $event, string $actorRole, ?string $actorId, ?string $note = null): void {
        $this->db->prepare('INSERT INTO delivery_events (id, delivery_id, event, actor_role, actor_id, note, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
            ->execute([Database::newId('evt'), $deliveryId, $event, $actorRole, $actorId, $note, Database::now()]);
    }

    private function timeline(string $deliveryId, bool $includeNotes): array {
        $stmt = $this->db->prepare('SELECT event, actor_role, note, created_at FROM delivery_events WHERE delivery_id = ? ORDER BY created_at ASC, id ASC');
        $stmt->execute([$deliveryId]);
        $events = [];
        foreach ($stmt->fetchAll() as $e) {
            if (!$includeNotes && !in_array($e['event'], ['pending', 'assigned', 'picked_up', 'in_transit', 'arrived', 'delivered', 'cancelled'], true)) {
                continue;
            }
            $item = ['event' => $e['event'], 'at' => $this->iso($e['created_at'])];
            if ($includeNotes) {
                $item['actor'] = $e['actor_role'];
                $item['note'] = $e['note'];
            }
            $events[] = $item;
        }
        return $events;
    }

    private function startOfTodayUtc(): string {
        // Business day follows Kano time (WAT, UTC+1).
        $local = new \DateTimeImmutable('today', new \DateTimeZone('Africa/Lagos'));
        return $local->setTimezone(new \DateTimeZone('UTC'))->format('Y-m-d H:i:s');
    }

    private function iso(?string $ts): ?string {
        if (!$ts) {
            return null;
        }
        return str_replace(' ', 'T', substr($ts, 0, 19)) . 'Z';
    }

    private function amountDue(array $row): float {
        return (float) $row['cod_amount'] + ($row['payment_mode'] === 'pay_on_delivery' ? (float) $row['delivery_fee'] : 0.0);
    }

    private function formatFull(array $row): array {
        return [
            'id'                  => $row['id'],
            'trackingCode'        => $row['tracking_code'],
            'status'              => $row['status'],
            'senderType'          => $row['sender_type'],
            'senderName'          => $row['sender_name'],
            'senderPhone'         => $row['sender_phone'],
            'senderLandmarkId'    => $row['sender_landmark_id'],
            'senderDetail'        => $row['sender_landmark_detail'],
            'recipientType'       => $row['recipient_type'],
            'recipientName'       => $row['recipient_name'],
            'recipientPhone'      => $row['recipient_phone'],
            'recipientLandmarkId' => $row['recipient_landmark_id'],
            'recipientDetail'     => $row['recipient_landmark_detail'],
            'itemCategory'        => $row['item_category'],
            'itemDescription'     => $row['item_description'],
            'isFragile'           => (bool) $row['is_fragile'],
            'specialInstructions' => $row['special_instructions'],
            'paymentMode'         => $row['payment_mode'],
            'deliveryFee'         => (float) $row['delivery_fee'],
            'codAmount'           => (float) $row['cod_amount'],
            'amountDue'           => $this->amountDue($row),
            'assignedRider'       => $row['assigned_rider_id'] ? [
                'id'         => $row['assigned_rider_id'],
                'name'       => $row['rider_name'] ?? null,
                'phone'      => $row['rider_phone'] ?? null,
                'bikeNumber' => $row['rider_bike_number'] ?? null,
            ] : null,
            'otpAttempts'         => (int) $row['otp_attempts'],
            'otpLocked'           => (bool) $row['otp_locked'],
            'cancelReason'        => $row['cancel_reason'],
            'codPayoutStatus'     => $row['cod_payout_status'],
            'codPaidAt'           => $this->iso($row['cod_paid_at']),
            'codPayoutReference'  => $row['cod_payout_reference'],
            'createdAt'           => $this->iso($row['created_at']),
            'updatedAt'           => $this->iso($row['updated_at']),
            'deliveredAt'         => $this->iso($row['otp_verified_at']),
        ];
    }

    // What anyone holding the tracking code may see: no addresses, no customer phone numbers.
    private function formatPublic(array $row): array {
        $rider = null;
        if ($row['assigned_rider_id'] && in_array($row['status'], self::ACTIVE_STATUSES, true)) {
            $stmt = $this->db->prepare('SELECT name, phone, bike_number FROM riders WHERE id = ?');
            $stmt->execute([$row['assigned_rider_id']]);
            if ($r = $stmt->fetch()) {
                $rider = ['name' => explode(' ', trim($r['name']))[0], 'phone' => $r['phone'], 'bikeNumber' => $r['bike_number']];
            }
        }
        $recipientParts = preg_split('/\s+/', trim($row['recipient_name']));
        $recipientMasked = $recipientParts[0] . (isset($recipientParts[1]) ? ' ' . mb_substr($recipientParts[1], 0, 1) . '.' : '');

        return [
            'trackingCode'        => $row['tracking_code'],
            'status'              => $row['status'],
            'senderName'          => $row['sender_name'],
            'recipientName'       => $recipientMasked,
            'senderLandmarkId'    => $row['sender_landmark_id'],
            'recipientLandmarkId' => $row['recipient_landmark_id'],
            'itemCategory'        => $row['item_category'],
            'isFragile'           => (bool) $row['is_fragile'],
            'paymentMode'         => $row['payment_mode'],
            'deliveryFee'         => (float) $row['delivery_fee'],
            'codAmount'           => (float) $row['cod_amount'],
            'amountDue'           => $this->amountDue($row),
            'rider'               => $rider,
            'timeline'            => $this->timeline($row['id'], false),
            'createdAt'           => $this->iso($row['created_at']),
            'deliveredAt'         => $this->iso($row['otp_verified_at']),
        ];
    }

    private function formatRider(array $r): array {
        return [
            'id'         => $r['id'],
            'name'       => $r['name'],
            'phone'      => $r['phone'],
            'bikeNumber' => $r['bike_number'],
            'zone'       => $r['active_zone'],
            'status'     => $r['status'],
            'active'     => (bool) $r['active'],
            'hasPin'     => (bool) $r['has_pin'],
            'activeJobs' => (int) $r['active_jobs'],
            'cashHeld'   => (float) $r['cash_held'],
        ];
    }
}
