<?php
// Fimrash Logistics Services - Ultra-Fast REST API for Kano Intra-State Courier Dispatch
// Fully compatible with Whogohost (cPanel Apache/LiteSpeed) & Vercel CORS

// 1. CORS Configuration for Vercel Frontend & External Clients
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin');
header('Access-Control-Max-Age: 86400');
header('Content-Type: application/json; charset=utf-8');

// 2. Preflight OPTIONS Handler
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../src/Database.php';

use Fimrash\Database;

// 3. Robust URI Normalization for Whogohost cPanel subdirectories & subdomains
$rawUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$scriptName = $_SERVER['SCRIPT_NAME'] ?? '';
$scriptDir = dirname($scriptName);

// Strip script directory or /index.php if present
$cleanUri = $rawUri;
if ($scriptDir !== '/' && str_starts_with($cleanUri, $scriptDir)) {
    $cleanUri = substr($cleanUri, strlen($scriptDir));
}
if (str_starts_with($cleanUri, '/index.php')) {
    $cleanUri = substr($cleanUri, strlen('/index.php'));
}
$cleanUri = '/' . ltrim($cleanUri, '/');

// Also handle query param fallback: ?route=/api/...
if (isset($_GET['route'])) {
    $cleanUri = '/' . ltrim($_GET['route'], '/');
}

$method = $_SERVER['REQUEST_METHOD'];

// Helper to send JSON responses
function jsonResponse(array $data, int $statusCode = 200): void {
    http_response_code($statusCode);
    echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

// Helper to get request payload
function getJsonInput(): array {
    $input = file_get_contents('php://input');
    return json_decode($input, true) ?: [];
}

try {
    $db = Database::getConnection();

    // ─────────────────────────────────────────────────────────────
    // ROUTE 1: HEALTH CHECK
    // ─────────────────────────────────────────────────────────────
    if ($cleanUri === '/api/health' || $cleanUri === '/health' || $cleanUri === '/') {
        jsonResponse([
            'status' => 'healthy',
            'service' => 'Fimrash Logistics Services REST API',
            'version' => '1.2.0-production',
            'host' => $_SERVER['HTTP_HOST'] ?? 'whogohost-server',
            'coverage' => 'Kano Metropolitan Area, Nigeria',
            'php_version' => PHP_VERSION,
            'timestamp' => date('c')
        ]);
    }

    // ─────────────────────────────────────────────────────────────
    // ROUTE 2: LIST & CREATE DELIVERIES (/api/deliveries)
    // ─────────────────────────────────────────────────────────────
    if ($cleanUri === '/api/deliveries') {
        // GET: Fetch all active & past deliveries
        if ($method === 'GET') {
            $stmt = $db->query("SELECT * FROM deliveries ORDER BY created_at DESC LIMIT 100");
            $deliveries = $stmt->fetchAll();
            jsonResponse(['status' => 'success', 'data' => $deliveries]);
        }

        // POST: Create a new intra-Kano consignment
        if ($method === 'POST') {
            $input = getJsonInput();

            $randomSuffix = rand(1000, 9999);
            $trackingCode = 'FMR-KN-' . $randomSuffix;
            $otpCode = (string)rand(1000, 9999);
            $deliveryId = 'del_' . time() . '_' . rand(100, 999);

            $senderType = $input['sender_type'] ?? 'home';
            $senderName = $input['sender_name'] ?? 'Fatima Bakes';
            $senderPhone = $input['sender_phone'] ?? '08030000000';
            $senderLandmark = $input['sender_landmark_id'] ?? 'gyadi-gyadi';
            $senderDetail = $input['sender_landmark_detail'] ?? 'Behind Veterinary, Court Road';

            $recipientType = $input['recipient_type'] ?? 'home';
            $recipientName = $input['recipient_name'] ?? 'Amina Sani';
            $recipientPhone = $input['recipient_phone'] ?? '08150000000';
            $recipientLandmark = $input['recipient_landmark_id'] ?? 'naibawa';
            $recipientDetail = $input['recipient_landmark_detail'] ?? 'Near Jallaba Mosque';

            $itemCategory = $input['item_category'] ?? 'Cakes, Pastries & Bakes';
            $itemDescription = $input['item_description'] ?? 'Standard Consignment Parcel';
            $isFragile = !empty($input['is_fragile']) ? 1 : 0;
            $specialInstructions = $input['special_instructions'] ?? '';

            $paymentMode = $input['payment_mode'] ?? 'pay_on_delivery';
            $deliveryFee = floatval($input['delivery_fee'] ?? 1000);

            $stmt = $db->prepare("
                INSERT INTO deliveries (
                    id, tracking_code, sender_type, sender_name, sender_phone, sender_landmark_id, sender_landmark_detail,
                    recipient_type, recipient_name, recipient_phone, recipient_landmark_id, recipient_landmark_detail,
                    item_category, item_description, is_fragile, special_instructions,
                    payment_mode, delivery_fee, otp_code, assigned_rider_id, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'rider_04', 'pending')
            ");

            $stmt->execute([
                $deliveryId, $trackingCode, $senderType, $senderName, $senderPhone, $senderLandmark, $senderDetail,
                $recipientType, $recipientName, $recipientPhone, $recipientLandmark, $recipientDetail,
                $itemCategory, $itemDescription, $isFragile, $specialInstructions,
                $paymentMode, $deliveryFee, $otpCode
            ]);

            jsonResponse([
                'success' => true,
                'message' => 'Fimrash Waybill logged successfully',
                'delivery' => [
                    'id' => $deliveryId,
                    'tracking_code' => $trackingCode,
                    'otp_code' => $otpCode,
                    'delivery_fee' => $deliveryFee,
                    'payment_mode' => $paymentMode,
                    'status' => 'pending',
                    'created_at' => date('H:i')
                ]
            ], 201);
        }
    }

    // ─────────────────────────────────────────────────────────────
    // ROUTE 3: TRACK SINGLE DELIVERY (/api/deliveries/{code})
    // ─────────────────────────────────────────────────────────────
    if (preg_match('#^/api/deliveries/([A-Za-z0-9\-_]+)$#', $cleanUri, $matches)) {
        $code = trim($matches[1]);
        $stmt = $db->prepare("SELECT * FROM deliveries WHERE tracking_code = ? OR id = ? LIMIT 1");
        $stmt->execute([$code, $code]);
        $delivery = $stmt->fetch();

        if (!$delivery) {
            jsonResponse(['error' => 'Consignment not found with code: ' . $code], 404);
        }

        jsonResponse(['status' => 'success', 'data' => $delivery]);
    }

    // ─────────────────────────────────────────────────────────────
    // ROUTE 4: UPDATE TRANSIT STATUS (/api/deliveries/{id}/status)
    // ─────────────────────────────────────────────────────────────
    if (preg_match('#^/api/deliveries/([A-Za-z0-9\-_]+)/status$#', $cleanUri, $matches) && $method === 'POST') {
        $deliveryId = $matches[1];
        $input = getJsonInput();
        $newStatus = $input['status'] ?? 'picked_up';

        $stmt = $db->prepare("UPDATE deliveries SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
        $stmt->execute([$newStatus, $deliveryId]);

        jsonResponse(['success' => true, 'id' => $deliveryId, 'new_status' => $newStatus]);
    }

    // ─────────────────────────────────────────────────────────────
    // ROUTE 5: VERIFY HANDSHAKE OTP & CLEAR DELIVERY (/api/deliveries/{id}/verify-otp)
    // ─────────────────────────────────────────────────────────────
    if (preg_match('#^/api/deliveries/([A-Za-z0-9\-_]+)/verify-otp$#', $cleanUri, $matches) && $method === 'POST') {
        $deliveryId = $matches[1];
        $input = getJsonInput();
        $enteredOtp = trim($input['otp_code'] ?? '');

        $stmt = $db->prepare("SELECT * FROM deliveries WHERE id = ? LIMIT 1");
        $stmt->execute([$deliveryId]);
        $delivery = $stmt->fetch();

        if (!$delivery) {
            jsonResponse(['error' => 'Delivery job not found'], 404);
        }

        if ($delivery['otp_code'] !== $enteredOtp) {
            jsonResponse(['error' => 'Lambar sirri ba daidai ba (Invalid 4-Digit OTP). Please verify with recipient.'], 422);
        }

        $feeCollected = ($delivery['payment_mode'] === 'pay_on_delivery') ? 1 : 0;

        $updateStmt = $db->prepare("
            UPDATE deliveries 
            SET status = 'delivered', 
                otp_verified_at = CURRENT_TIMESTAMP,
                cod_collected_by_rider = ?,
                updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        ");
        $updateStmt->execute([$feeCollected, $deliveryId]);

        jsonResponse([
            'success' => true,
            'message' => 'Lambar sirri ta tabbata (OTP Handshake Verified). Consignment delivered.',
            'status' => 'delivered',
            'delivery_fee_collected' => ($feeCollected ? floatval($delivery['delivery_fee']) : 0)
        ]);
    }

    // ─────────────────────────────────────────────────────────────
    // ROUTE 6: STATION CASH RECONCILIATION (/api/reconciliation)
    // ─────────────────────────────────────────────────────────────
    if ($cleanUri === '/api/reconciliation' && $method === 'GET') {
        $statsStmt = $db->query("
            SELECT 
                COUNT(*) as total_deliveries,
                SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as completed_deliveries,
                SUM(CASE WHEN status != 'delivered' THEN 1 ELSE 0 END) as active_deliveries,
                SUM(CASE WHEN status = 'delivered' AND payment_mode = 'pay_on_delivery' AND cod_remitted_to_vendor = 0 THEN delivery_fee ELSE 0 END) as rider_cash_in_hand,
                SUM(CASE WHEN status = 'delivered' THEN delivery_fee ELSE 0 END) as total_delivery_revenue
            FROM deliveries
        ");
        $stats = $statsStmt->fetch();

        jsonResponse(['status' => 'success', 'data' => $stats]);
    }

    // ─────────────────────────────────────────────────────────────
    // ROUTE 7: REMIT RIDER CASH TO OFFICE VAULT (/api/remit-cash)
    // ─────────────────────────────────────────────────────────────
    if ($cleanUri === '/api/remit-cash' && $method === 'POST') {
        $stmt = $db->query("UPDATE deliveries SET cod_remitted_to_vendor = 1 WHERE status = 'delivered' AND payment_mode = 'pay_on_delivery'");
        jsonResponse([
            'success' => true,
            'message' => 'Physical courier cash pouches marked as remitted to station office vault.'
        ]);
    }

    // 404 Endpoint Not Found
    jsonResponse([
        'error' => 'Endpoint not found',
        'requested_uri' => $cleanUri,
        'method' => $method
    ], 404);

} catch (\Exception $e) {
    jsonResponse([
        'error' => 'Server error occurred on Whogohost API',
        'details' => $e->getMessage()
    ], 500);
}
