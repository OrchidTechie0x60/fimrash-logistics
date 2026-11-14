<?php
// Fimrash Logistics Services - Lightweight Headless REST API
// Ultra-fast PHP 8.x Router for Kano Intra-State Courier Dispatch

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

// Preflight CORS handler
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../src/Database.php';

use Fimrash\Database;

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Helper to send JSON
function jsonResponse(array $data, int $statusCode = 200): void {
    http_response_code($statusCode);
    echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    exit;
}

// Helper to get request payload
function getJsonInput(): array {
    $input = file_get_contents('php://input');
    return json_decode($input, true) ?: [];
}

// Simple Route Dispatcher
try {
    $db = Database::getConnection();

    // 1. Health check
    if ($uri === '/api/health') {
        jsonResponse([
            'status' => 'healthy',
            'service' => 'Fimrash Logistics API',
            'version' => '1.0.0-mvp',
            'operating_city' => 'Kano Metropolis, Nigeria',
            'php_version' => PHP_VERSION,
            'timestamp' => date('c')
        ]);
    }

    // 2. Deliveries: List or Create
    if ($uri === '/api/deliveries') {
        if ($method === 'GET') {
            $stmt = $db->query("SELECT * FROM deliveries ORDER BY created_at DESC");
            $deliveries = $stmt->fetchAll();
            jsonResponse(['data' => $deliveries]);
        }

        if ($method === 'POST') {
            $input = getJsonInput();

            $trackingCode = 'FMR-KN-' . rand(1000, 9999);
            $otpCode = (string)rand(1000, 9999);
            $deliveryId = 'del_' . time() . '_' . rand(100, 999);

            $senderName = $input['sender_name'] ?? 'Anonymous Merchant';
            $senderPhone = $input['sender_phone'] ?? '08000000000';
            $senderLandmark = $input['sender_landmark_id'] ?? 'kwari-textiles';
            $senderDetail = $input['sender_landmark_detail'] ?? '';

            $recipientName = $input['recipient_name'] ?? 'Valued Customer';
            $recipientPhone = $input['recipient_phone'] ?? '08000000000';
            $recipientLandmark = $input['recipient_landmark_id'] ?? 'nassarawa-gra';
            $recipientDetail = $input['recipient_landmark_detail'] ?? '';

            $itemCategory = $input['item_category'] ?? 'General Parcel';
            $itemDescription = $input['item_description'] ?? '';
            $itemValue = floatval($input['item_value'] ?? 0);
            $paymentMode = $input['payment_mode'] ?? 'prepaid';
            $deliveryFee = floatval($input['delivery_fee'] ?? 1200);

            $stmt = $db->prepare("
                INSERT INTO deliveries (
                    id, tracking_code, sender_name, sender_phone, sender_landmark_id, sender_landmark_detail,
                    recipient_name, recipient_phone, recipient_landmark_id, recipient_landmark_detail,
                    item_category, item_description, item_value, payment_mode, delivery_fee, otp_code, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
            ");

            $stmt->execute([
                $deliveryId, $trackingCode, $senderName, $senderPhone, $senderLandmark, $senderDetail,
                $recipientName, $recipientPhone, $recipientLandmark, $recipientDetail,
                $itemCategory, $itemDescription, $itemValue, $paymentMode, $deliveryFee, $otpCode
            ]);

            jsonResponse([
                'success' => true,
                'message' => 'Delivery booked successfully',
                'delivery' => [
                    'id' => $deliveryId,
                    'tracking_code' => $trackingCode,
                    'otp_code' => $otpCode,
                    'delivery_fee' => $deliveryFee,
                    'status' => 'pending'
                ]
            ], 201);
        }
    }

    // 3. Single Delivery Track: /api/deliveries/{tracking_code}
    if (preg_match('#^/api/deliveries/([A-Za-z0-9\-_]+)$#', $uri, $matches)) {
        $code = $matches[1];
        $stmt = $db->prepare("SELECT * FROM deliveries WHERE tracking_code = ? OR id = ? LIMIT 1");
        $stmt->execute([$code, $code]);
        $delivery = $stmt->fetch();

        if (!$delivery) {
            jsonResponse(['error' => 'Delivery waybill not found'], 404);
        }

        jsonResponse(['data' => $delivery]);
    }

    // 4. Update Status: /api/deliveries/{id}/status
    if (preg_match('#^/api/deliveries/([A-Za-z0-9\-_]+)/status$#', $uri, $matches) && $method === 'POST') {
        $deliveryId = $matches[1];
        $input = getJsonInput();
        $newStatus = $input['status'] ?? 'picked_up';

        $stmt = $db->prepare("UPDATE deliveries SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
        $stmt->execute([$newStatus, $deliveryId]);

        jsonResponse(['success' => true, 'new_status' => $newStatus]);
    }

    // 5. Verify OTP & Handshake: /api/deliveries/{id}/verify-otp
    if (preg_match('#^/api/deliveries/([A-Za-z0-9\-_]+)/verify-otp$#', $uri, $matches) && $method === 'POST') {
        $deliveryId = $matches[1];
        $input = getJsonInput();
        $enteredOtp = $input['otp_code'] ?? '';
        $confirmCash = !empty($input['confirm_cash_collected']);

        $stmt = $db->prepare("SELECT * FROM deliveries WHERE id = ? LIMIT 1");
        $stmt->execute([$deliveryId]);
        $delivery = $stmt->fetch();

        if (!$delivery) {
            jsonResponse(['error' => 'Delivery not found'], 404);
        }

        if ($delivery['otp_code'] !== trim($enteredOtp)) {
            jsonResponse(['error' => 'Invalid OTP code. Verify with recipient.'], 422);
        }

        // Execute atomic state update
        $db->beginTransaction();
        $updateStmt = $db->prepare("
            UPDATE deliveries 
            SET status = 'delivered', 
                otp_verified_at = CURRENT_TIMESTAMP,
                cod_collected_by_rider = ?,
                updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        ");
        $updateStmt->execute([$confirmCash ? 1 : 0, $deliveryId]);

        // Insert COD ledger record if COD
        if ($delivery['payment_mode'] === 'cod' && $confirmCash) {
            $ledgerId = 'led_' . time() . '_' . rand(100, 999);
            $grossCod = floatval($delivery['item_value']);
            $fee = floatval($delivery['delivery_fee']);
            $netPayout = $grossCod - $fee;

            $ledgerStmt = $db->prepare("
                INSERT INTO cod_ledger (id, delivery_id, rider_id, gross_cod, delivery_fee, net_vendor_payout, status)
                VALUES (?, ?, ?, ?, ?, ?, 'held_by_rider')
            ");
            $ledgerStmt->execute([
                $ledgerId, $deliveryId, $delivery['assigned_rider_id'] ?? 'rider_04',
                $grossCod, $fee, $netPayout
            ]);
        }

        $db->commit();
        jsonResponse([
            'success' => true,
            'message' => 'OTP Handshake verified. Delivery marked complete.',
            'status' => 'delivered'
        ]);
    }

    // 6. Reconciliation Summary: /api/reconciliation
    if ($uri === '/api/reconciliation' && $method === 'GET') {
        $statsStmt = $db->query("
            SELECT 
                COUNT(*) as total_deliveries,
                SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as completed_deliveries,
                SUM(CASE WHEN payment_mode = 'cod' AND cod_collected_by_rider = 1 AND cod_remitted_to_vendor = 0 THEN item_value ELSE 0 END) as rider_cash_in_hand,
                SUM(CASE WHEN status = 'delivered' THEN delivery_fee ELSE 0 END) as total_fees_earned,
                SUM(CASE WHEN payment_mode = 'cod' AND cod_collected_by_rider = 1 AND cod_remitted_to_vendor = 0 THEN (item_value - delivery_fee) ELSE 0 END) as pending_vendor_payout
            FROM deliveries
        ");
        $stats = $statsStmt->fetch();

        jsonResponse(['data' => $stats]);
    }

    // Default 404
    jsonResponse(['error' => 'Endpoint not found', 'path' => $uri], 404);

} catch (\Exception $e) {
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }
    jsonResponse(['error' => 'Server error', 'details' => $e->getMessage()], 500);
}
