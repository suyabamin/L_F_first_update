<?php
require __DIR__ . '/config.php';

$userId = !empty($_SESSION['user_id']) ? (int) $_SESSION['user_id'] : null;
$payload = json_decode(file_get_contents('php://input'), true) ?: $_POST;
$itemId = (int) ($payload['item_id'] ?? 0);
$reason = clean_text($payload['reason'] ?? '');
$details = clean_text($payload['details'] ?? '');

if ($itemId < 1 || $reason === '') {
    header('Content-Type: application/json');
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Reason and item are required.']);
    exit;
}

$pdo->prepare('INSERT INTO reports (reporter_id, item_id, reason, details) VALUES (?, ?, ?, ?)')
    ->execute([$userId, $itemId, $reason, $details ?: null]);

header('Content-Type: application/json');
echo json_encode(['success' => true, 'message' => 'Report submitted. Our team will review it.']);
